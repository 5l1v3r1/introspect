# introspect

This project aims to discover how neural networks&mdash;and specifically LSTMs&mdash;represent knowledge. I believe that this is a relatively unexplored question, yet it could be essential to the future of deep learning. By understanding how neural nets represent knowledge, we may be able to build better architectures or even invent new training algorithms.

# Tools

Currently, this repository comes with two tools: a CLI called *rnntool*, and a web application called *inspector*.

## rnntool

This CLI tool is useful for creating, training, and benchmarking neural networks. It makes it possible to interactively conduct experiments with neural networks.

Here is an example in which we train an LSTM on the XOR task:

```
$ go run *.go
> new LSTM(1,5) Dense(5,1)
> cost xor(10) 100
Total cost: 694.6731270040516
Average cost: 6.946731270040516
> train xor(10) 10000 0.001
> cost xor(10) 100
Total cost: 0.6121579607608016
Average cost: 0.006121579607608016
> save trained_xor
```

Commands in *rnnblock* deal with a global RNN block. The global block can be set using the `new` command, creating a randomized RNN with the specified structure. The global block can also be set using the `load` command, which loads a block from a file.

You can run the `help` command for more details on usage.

## inspector

This tool helps you view and edit the weights and biases of an RNN. It allows you to load a neural network file (potentially created by *rnntool*) and navigate its structure. You can then save your changes back to a file.
