package main

import (
	"github.com/gorilla/handlers"
	"github.com/rs/cors"
	"net/http"
	"os"
)

func main() {
	fs := http.FileServer(http.Dir("."))
	logger := handlers.CombinedLoggingHandler(os.Stdout, fs)
	handler := cors.Default().Handler(logger)
	http.ListenAndServe(":8080", handler)
}
