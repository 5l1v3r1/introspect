package main

import (
	"github.com/gopherjs/gopherjs/js"
	"github.com/unixpickle/autofunc"
	"github.com/unixpickle/serializer"
	"github.com/unixpickle/sgd"

	"github.com/unixpickle/weakai/neuralnet"
	"github.com/unixpickle/weakai/rnn"
)

func main() {
	js.Global.Set("deserializeObject", deserializeObject)
}

func deserializeObject(args *js.Object) interface{} {
	buf := args.Interface().([]uint8)
	b := make([]byte, len(buf))
	for i, x := range buf {
		b[i] = x
	}
	slice, err := serializer.DeserializeSlice(b)
	if err == nil {
		return accessibleObject(slice)
	}
	obj, err := serializer.DeserializeWithType(b)
	if err == nil {
		return accessibleObject(obj)
	}
	return accessibleActivation("unknown")
}

func accessibleObject(obj interface{}) interface{} {
	switch obj := obj.(type) {
	case neuralnet.Network:
		var children []interface{}
		for child := range obj {
			children = append(children, accessibleObject(child))
		}
		return map[string]interface{}{
			"type": "Network",
			"data": children,
		}
	case *rnn.LSTM:
		return accessibleLearner("LSTM", obj)
	case *neuralnet.DenseLayer:
		return accessibleLearner("DenseLayer", obj)
	case *rnn.NetworkBlock:
		return map[string]interface{}{
			"type": "NetworkBlock",
			"data": map[string]interface{}{
				"startState": []float64(obj.StartState().(rnn.VecState)),
				"network":    accessibleObject(obj.Network()),
			},
		}
	case neuralnet.HyperbolicTangent:
		return accessibleActivation("HyperbolicTangent")
	case *neuralnet.HyperbolicTangent:
		return accessibleActivation("HyperbolicTangent")
	case neuralnet.Sigmoid:
		return accessibleActivation("Sigmoid")
	case *neuralnet.Sigmoid:
		return accessibleActivation("Sigmoid")
	case neuralnet.ReLU:
		return accessibleActivation("ReLU")
	case *neuralnet.ReLU:
		return accessibleActivation("ReLU")
	case *neuralnet.RescaleLayer:
		return map[string]interface{}{
			"type": "RescaleLayer",
			"data": map[string]interface{}{
				"scale": obj.Scale,
				"bias":  obj.Bias,
			},
		}
	case *neuralnet.DropoutLayer:
		return map[string]interface{}{
			"type": "DropoutLayer",
			"data": map[string]interface{}{
				"keepProbability": obj.KeepProbability,
				"training":        obj.Training,
			},
		}
	}
	return accessibleActivation("unknown")
}

func accessibleLearner(name string, l sgd.Learner) interface{} {
	var params []interface{}
	for _, p := range l.Parameters() {
		params = append(params, accessibleVariable(p))
	}
	return map[string]interface{}{
		"type": name,
		"data": params,
	}
}

func accessibleVariable(v *autofunc.Variable) interface{} {
	return []float64(v.Vector)
}

func accessibleActivation(name string) interface{} {
	return map[string]interface{}{"type": name, "data": map[string]interface{}{}}
}
