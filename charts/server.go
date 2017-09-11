package main

import (
	"github.com/gorilla/handlers"
	"github.com/rs/cors"
	"net/http"
	"os"
)

func sendData(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "data.json")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/data.json", sendData)
	cors := cors.Default().Handler(mux)
	compressed := handlers.CompressHandler(cors)
	logger := handlers.LoggingHandler(os.Stdout, compressed)
	http.ListenAndServe(":8080", logger)
}
