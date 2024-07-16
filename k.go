package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID string `json:"id"`
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	// Get the node ID from the environment variable
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	// Create a new node with the parsed node ID
	node := spaceflake.NewNode(nodeID)
	worker := node.NewWorker()
	sf, err := worker.GenerateSpaceflake()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := SpaceflakeResponse{ID: sf.StringID()}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/generate", generateSpaceflake)
	fmt.Println("Server is listening on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
