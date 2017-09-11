package main

import (
	"github.com/rs/cors"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("."))
	handler := cors.Default().Handler(fs)
	http.ListenAndServe(":8080", handler)
}
