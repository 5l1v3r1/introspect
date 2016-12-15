package main

import (
	"fmt"
	"strconv"

	"github.com/unixpickle/autofunc"
	"github.com/unixpickle/num-analysis/linalg"
	"github.com/unixpickle/weakai/rnn"
)

var RunnerBlock rnn.Block
var RunnerState rnn.State

func startRunning(args []string) {
	if len(args) != 0 {
		fmt.Println("Usage: start")
		return
	}
	if CurrentBlock == nil {
		fmt.Println("No block to run.")
		return
	}
	RunnerBlock = CurrentBlock
	RunnerState = CurrentBlock.StartState()
	printRunnerState()
}

func stepRunning(args []string) {
	if RunnerBlock == nil {
		fmt.Println("No session is running.")
		return
	}

	var input linalg.Vector
	for _, arg := range args {
		val, err := strconv.ParseFloat(arg, 64)
		if err != nil {
			fmt.Println("Invalid vector component:", arg)
			return
		}
		input = append(input, val)
	}

	out := RunnerBlock.ApplyBlock([]rnn.State{RunnerState}, []autofunc.Result{
		&autofunc.Variable{Vector: input},
	})
	RunnerState = out.States()[0]

	fmt.Println("Output:", out.Outputs()[0])
	printRunnerState()
}

func printRunnerState() {
	fmt.Printf("State: %#v", RunnerState)
	fmt.Println()
}
