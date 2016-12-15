package main

import (
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"time"

	"github.com/chzyer/readline"
	shellwords "github.com/mattn/go-shellwords"
	"github.com/unixpickle/serializer"
	"github.com/unixpickle/weakai/rnn"
)

var CurrentBlock rnn.Block

func main() {
	rand.Seed(time.Now().UnixNano())

	rl, err := readline.New("> ")
	if err != nil {
		die("init readline:", err)
	}
	defer rl.Close()

	wordParser := shellwords.Parser{}
	for {
		line, err := rl.Readline()
		if err != nil {
			return
		}
		parts, err := wordParser.Parse(line)
		if err != nil {
			fmt.Fprintln(os.Stderr, "parse error:", err)
			continue
		}
		if len(parts) > 0 && parts[0] == "exit" {
			return
		}
		handleCommand(parts)
	}
}

func handleCommand(args []string) {
	if len(args) == 0 {
		return
	}
	switch args[0] {
	case "help":
		printHelp()
	case "save":
		saveBlock(args[1:])
	case "load":
		loadBlock(args[1:])
	case "new":
		newBlock(args[1:])
	case "train":
		trainBlock(args[1:])
	case "cost":
		costBlock(args[1:])
	default:
		fmt.Println("Unrecognized command:", args[0])
		fmt.Println()
		printHelp()
	}
}

func printHelp() {
	fmt.Println("Available commands:")
	fmt.Println()
	fmt.Println(" help")
	fmt.Println("   show this help message")
	fmt.Println(" exit")
	fmt.Println("   exit the process")
	fmt.Println(" save <file>")
	fmt.Println("   save current RNN to a file")
	fmt.Println(" load <file>")
	fmt.Println("   load an RNN from a file")
	fmt.Println(" new layers...")
	fmt.Println("   create a new RNN block")
	fmt.Println("   layer formats:")
	fmt.Println("    - LSTM(in,hidden)")
	fmt.Println("    - Dense(in,out)")
	fmt.Println("    - Sigmoid")
	fmt.Println("    - LogSoftmax")
	fmt.Println(" train <task> <num_samples> <step> [optimizer]")
	fmt.Println("   train the RNN block")
	fmt.Println("   tasks:")
	fmt.Println("    - xor(seqLen)")
	fmt.Println("   optimizers:")
	fmt.Println("    - adam")
	fmt.Println("    - plain")
	fmt.Println(" cost <task> <num_samples>")
	fmt.Println("   benchmark the RNN block on a task")
	fmt.Println()
}

func saveBlock(args []string) {
	if len(args) != 1 {
		fmt.Println("Usage: save <file>")
		return
	}
	if CurrentBlock == nil {
		fmt.Println("No block to save.")
		return
	}
	s, ok := CurrentBlock.(serializer.Serializer)
	if !ok {
		fmt.Println("Not serializable.")
		return
	}
	ser, err := serializer.SerializeWithType(s)
	if err != nil {
		fmt.Println("Serialize failed:", err)
		return
	}
	if err := ioutil.WriteFile(args[0], ser, 0755); err != nil {
		fmt.Println("Save failed:", err)
		return
	}
}

func loadBlock(args []string) {
	if len(args) != 1 {
		fmt.Println("Usage: load <file>")
		return
	}
	data, err := ioutil.ReadFile(args[0])
	if err != nil {
		fmt.Println("Load failed:", err)
		return
	}
	obj, err := serializer.DeserializeWithType(data)
	if err != nil {
		fmt.Println("Deserialize failed:", err)
		return
	}
	var ok bool
	CurrentBlock, ok = obj.(rnn.Block)
	if !ok {
		fmt.Printf("Not a block: %T", obj)
		fmt.Println()
	}
}

func die(args ...interface{}) {
	fmt.Fprintln(os.Stderr, args)
	os.Exit(1)
}
