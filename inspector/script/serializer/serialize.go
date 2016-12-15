package main

import (
	"fmt"

	"github.com/gopherjs/gopherjs/js"
	"github.com/unixpickle/autofunc"
	"github.com/unixpickle/serializer"
	"github.com/unixpickle/weakai/neuralnet"
	"github.com/unixpickle/weakai/rnn"
)

func serializeObject(args *js.Object) interface{} {
	s := objectToSerializer(args)
	if s == nil {
		return nil
	}
	data, _ := serializer.SerializeWithType(s)
	return data
}

func objectToSerializer(obj *js.Object) serializer.Serializer {
	data := obj.Get("data")
	switch obj.Get("type").String() {
	case "LSTM":
		stateSize := data.Index(1).Length()
		inputSize := data.Index(0).Length()/stateSize - stateSize
		lstm := rnn.NewLSTM(inputSize, stateSize)
		for i, p := range lstm.Parameters() {
			data := vectorObject(data.Index(i))
			copy(p.Vector, data)
		}
		return lstm
	case "Network":
		var list neuralnet.Network
		for i := 0; i < data.Length(); i++ {
			newObj, ok := objectToSerializer(data.Index(i)).(neuralnet.Layer)
			if !ok {
				return nil
			}
			list = append(list, newObj)
		}
		return list
	case "StackedBlock":
		var list rnn.StackedBlock
		for i := 0; i < data.Length(); i++ {
			newObj, ok := objectToSerializer(data.Index(i)).(rnn.Block)
			if !ok {
				return nil
			}
			list = append(list, newObj)
		}
		return list
	case "HyperbolicTangent":
		return &neuralnet.HyperbolicTangent{}
	case "Sigmoid":
		return &neuralnet.Sigmoid{}
	case "ReLU":
		return &neuralnet.ReLU{}
	case "LogSoftmaxLayer":
		return &neuralnet.LogSoftmaxLayer{}
	case "NetworkBlock":
		net, ok := objectToSerializer(data.Get("network")).(neuralnet.Network)
		if !ok {
			return nil
		}
		startState := vectorObject(data.Get("startState"))
		block := rnn.NewNetworkBlock(net, len(startState))
		copy(block.Parameters()[0].Vector, startState)
		return block
	case "DenseLayer":
		weights := vectorObject(data.Index(0))
		biases := vectorObject(data.Index(1))
		res := &neuralnet.DenseLayer{
			InputCount:  len(weights) / len(biases),
			OutputCount: len(biases),
		}
		res.Weights = &autofunc.LinTran{
			Rows: res.OutputCount,
			Cols: res.InputCount,
			Data: &autofunc.Variable{Vector: weights},
		}
		res.Biases = &autofunc.LinAdd{
			Var: &autofunc.Variable{Vector: biases},
		}
		return res
	case "RescaleLayer":
		return &neuralnet.RescaleLayer{
			Bias:  data.Get("bias").Float(),
			Scale: data.Get("scale").Float(),
		}
	case "DropoutLayer":
		return &neuralnet.DropoutLayer{
			KeepProbability: data.Get("keepProbability").Float(),
			Training:        data.Get("training").Bool(),
		}
	}
	return nil
}

func vectorObject(vec *js.Object) []float64 {
	switch vec := vec.Interface().(type) {
	case []float64:
		return vec
	case []interface{}:
		return []float64{}
	default:
		panic(fmt.Sprintf("unknown type: %T", vec))
	}
}
