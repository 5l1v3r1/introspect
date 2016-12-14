package main

import "github.com/gopherjs/gopherjs/js"

func main() {
	js.Global.Set("deserializeObject", deserializeObject)
	js.Global.Set("serializeObject", serializeObject)
}
