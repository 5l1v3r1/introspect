package main

import (
	"github.com/gopherjs/gopherjs/js"
	"github.com/unixpickle/serializer"
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
	switch obj.Get("type").String() {
	case "LSTM":
		params := obj.Get("data")
		stateSize := params.Index(1).Length()
		inputSize := params.Index(0).Length()/stateSize - stateSize
		lstm := rnn.NewLSTM(inputSize, stateSize)
		for i, p := range lstm.Parameters() {
			data := params.Index(i).Interface().([]float64)
			copy(p.Vector, data)
		}
		return lstm
	}
	return nil
}
