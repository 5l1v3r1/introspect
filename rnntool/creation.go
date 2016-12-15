package main

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/unixpickle/weakai/neuralnet"
	"github.com/unixpickle/weakai/rnn"
)

func newBlock(args []string) {
	var net rnn.StackedBlock
	lstmDesc := regexp.MustCompile(`^LSTM\(([0-9]*),([0-9]*)\)$`)
	denseDesc := regexp.MustCompile(`^Dense\(([0-9]*),([0-9]*)\)$`)
	for _, argDesc := range args {
		if argDesc == "Sigmoid" {
			net = append(net, rnn.NewNetworkBlock(neuralnet.Network{
				&neuralnet.Sigmoid{},
			}, 0))
		} else if argDesc == "LogSoftmax" {
			net = append(net, rnn.NewNetworkBlock(neuralnet.Network{
				&neuralnet.LogSoftmaxLayer{},
			}, 0))
		} else if parsed := lstmDesc.FindStringSubmatch(argDesc); parsed != nil {
			in, _ := strconv.Atoi(parsed[1])
			hidden, _ := strconv.Atoi(parsed[2])
			net = append(net, rnn.NewLSTM(in, hidden))
		} else if parsed := denseDesc.FindStringSubmatch(argDesc); parsed != nil {
			in, _ := strconv.Atoi(parsed[1])
			out, _ := strconv.Atoi(parsed[2])
			net = append(net, rnn.NewNetworkBlock(neuralnet.Network{
				neuralnet.NewDenseLayer(in, out),
			}, 0))
		} else {
			fmt.Println("Unable to parse block:", argDesc)
			return
		}
	}
	CurrentBlock = net
}
