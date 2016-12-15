package main

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/unixpickle/seqtasks"
	"github.com/unixpickle/sgd"
	"github.com/unixpickle/weakai/neuralnet"
	"github.com/unixpickle/weakai/rnn"
	"github.com/unixpickle/weakai/rnn/seqtoseq"
)

func trainBlock(args []string) {
	if len(args) != 3 && len(args) != 4 {
		fmt.Println("Usage: train <task> <num_samples> <step> [optimizer]")
		return
	}

	if CurrentBlock == nil {
		fmt.Println("No block to train.")
		return
	}

	task, cost := createTask(args[0])
	if task == nil {
		return
	}

	count, err := strconv.Atoi(args[1])
	if err != nil {
		fmt.Println("Invalid sample count:", args[1])
		return
	}

	step, err := strconv.ParseFloat(args[2], 64)
	if err != nil {
		fmt.Println("Invalid step size:", args[2])
		return
	}

	optimizer := "adam"
	if len(args) > 3 {
		optimizer = args[3]
	}
	gradienter := createGradienter(cost, optimizer)
	if gradienter == nil {
		return
	}

	s := task.NewSamples(count)
	sgd.SGD(gradienter, s, step, 1, 1)
}

func costBlock(args []string) {
	if len(args) != 2 {
		fmt.Println("Usage: cost <task> <num_samples>")
		return
	}

	if CurrentBlock == nil {
		fmt.Println("No block to benchmark.")
		return
	}

	task, cost := createTask(args[0])
	if task == nil {
		return
	}

	count, err := strconv.Atoi(args[1])
	if err != nil {
		fmt.Println("Invalid sample count:", args[1])
		return
	}

	s := task.NewSamples(count)
	total := seqtoseq.TotalCostBlock(CurrentBlock, 1, s, cost)

	fmt.Println("Total cost:", total)
	fmt.Println("Average cost:", total/float64(count))
}

func createTask(name string) (seqtasks.Task, neuralnet.CostFunc) {
	xorPattern := regexp.MustCompile(`^xor\(([0-9]*)\)$`)
	if match := xorPattern.FindStringSubmatch(name); match != nil {
		count, _ := strconv.Atoi(match[1])
		return &seqtasks.XORLastTask{SeqLen: count}, neuralnet.SigmoidCECost{}
	} else {
		fmt.Println("Unrecognized task:", name)
		return nil, nil
	}
}

func createGradienter(cost neuralnet.CostFunc, optimizer string) sgd.Gradienter {
	learner, ok := CurrentBlock.(sgd.Learner)
	if !ok {
		fmt.Println("Block is not an sgd.Learner.")
		return nil
	}
	seqGrad := &seqtoseq.Gradienter{
		Learner:  learner,
		SeqFunc:  &rnn.BlockSeqFunc{B: CurrentBlock},
		CostFunc: cost,
	}
	switch optimizer {
	case "adam":
		return &sgd.Adam{Gradienter: seqGrad}
	case "plain":
		return seqGrad
	default:
		fmt.Println("Unrecognized optimizer:", optimizer)
		return nil
	}
}
