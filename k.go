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
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	node := spaceflake.NewNode(nodeID)
	worker := node.NewWorker()
	sf, err := worker.GenerateSpaceflake()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := SpaceflakeResponse{
		ID:        sf.StringID(),
		Decompose: sf.Decompose(),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/generate", generateSpaceflake)
	fmt.Println("Server is listening on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}


from locust import HttpUser, task, between, events
from locust.runners import STATE_STOPPING, STATE_STOPPED, STATE_RUNNING
from threading import Lock

class SpaceflakeUser(HttpUser):
    wait_time = between(1, 5)  # Wait time between tasks in seconds

    def on_start(self):
        self.ids = self.environment.ids
        self.lock = self.environment.lock

    @task
    def generate_spaceflake(self):
        response = self.client.get("/generate", verify=False)
        if response.status_code == 200:
            data = response.json()
            spaceflake_id = data['id']
            with self.lock:
                if spaceflake_id in self.ids:
                    print(f"Duplicate ID found: {spaceflake_id}")
                self.ids.add(spaceflake_id)

# Initialize shared data structures
@events.init.add_listener
def on_locust_init(environment, **_kwargs):
    environment.ids = set()
    environment.lock = Lock()

# Print all generated IDs when the test stops
@events.test_stop.add_listener
def on_test_stop(environment, **_kwargs):
    print(f"Total IDs generated: {len(environment.ids)}")
    # Optional: Write IDs to a file for further analysis
    with open("generated_ids.txt", "w") as f:
        for spaceflake_id in environment.ids:
            f.write(f"{spaceflake_id}\n")

if __name__ == "__main__":
    import os
    os.system("locust -f locustfile.py --host=http://localhost:8080")



-----


from locust import HttpUser, task, between, events
from threading import Lock

class SpaceflakeUser(HttpUser):
    wait_time = between(1, 5)  # Wait time between tasks in seconds

    def on_start(self):
        # Initialize a lock for file writing
        self.lock = self.environment.lock

    @task
    def generate_spaceflake(self):
        response = self.client.get("/generate", verify=False)
        if response.status_code == 200:
            data = response.json()
            spaceflake_id = data['id']
            with self.lock:
                with open("generated_ids.txt", "a") as file:
                    file.write(f"{spaceflake_id}\n")

# Initialize shared lock
@events.init.add_listener
def on_locust_init(environment, **_kwargs):
    environment.lock = Lock()

if __name__ == "__main__":
    import os
    os.system("locust -f locustfile.py --host=http://localhost:8080")


	-----


from locust import HttpUser, task, between, events
from threading import Lock
from datetime import datetime

class SpaceflakeUser(HttpUser):
	wait_time = between(1, 5)  # Wait time between tasks in seconds

	def on_start(self):
		# Initialize a lock for file writing
		self.lock = self.environment.lock

	@task
	def generate_spaceflake(self):
		response = self.client.get("/generate", verify=False)
		if response.status_code == 200:
			data = response.json()
			spaceflake_id = data['id']
			with self.lock:
				with open(self.environment.file_name, "a") as file:
					file.write(f"{spaceflake_id}\n")

# Initialize shared lock and create a unique filename
@events.init.add_listener
def on_locust_init(environment, **_kwargs):
	environment.lock = Lock()
	environment.file_name = f"generated_ids_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
	print(f"IDs will be saved to {environment.file_name}")

if __name__ == "__main__":
	import os
	os.system("locust -f locustfile.py --host=http://localhost:8080")
