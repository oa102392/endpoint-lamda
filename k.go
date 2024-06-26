package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID string `json:"id"`
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	node := spaceflake.NewNode(1)
	worker := node.NewWorker()
	sf, err := worker.GenerateSpaceflake()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := SpaceflakeResponse{ID: sf.String()}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/generate", generateSpaceflake)
	fmt.Println("Server is listening on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
