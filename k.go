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



	----


	package main

	import (
		"encoding/json"
		"fmt"
		"log"
		"net/http"
		"os"
		"strconv"
		"strings"
		"sync"
	
		"github.com/kkrypt0nn/spaceflake"
	)
	
	type SpaceflakeResponse struct {
		ID        string            `json:"id"`
		Decompose map[string]uint64 `json:"decompose"`
	}
	
	var (
		mu       sync.Mutex
		workerID uint64 = 0
		node     *spaceflake.Node
	)
	
	func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
		nodeIDStr := os.Getenv("NODE_ID")
		nodeIDParts := strings.Split(nodeIDStr, "-")
		nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
		if err != nil {
			http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
			return
		}
	
		mu.Lock()
		if node == nil {
			node = spaceflake.NewNode(nodeID)
		}
		currentWorkerID := workerID
		workerID = (workerID + 1) % 31 // Wrap around workerID if it exceeds 31
		mu.Unlock()
	
		worker := node.NewWorker(currentWorkerID)
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
	

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

var (
	mu    sync.Mutex
	node  *spaceflake.Node
)

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	mu.Lock()
	if node == nil {
		node = spaceflake.NewNode(nodeID)
	}
	worker := node.NewWorker()
	mu.Unlock()

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


--------------


package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

var (
	mu        sync.Mutex
	node      *spaceflake.Node
	sequence  uint64
	lastTime  uint64
	baseEpoch uint64 = 1420070400000
)

func currentTimeMillis() uint64 {
	return uint64(time.Now().UnixNano() / int64(time.Millisecond))
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if node == nil {
		node = spaceflake.NewNode(nodeID)
	}

	worker := node.NewWorker()
	currentTime := currentTimeMillis()

	if currentTime == lastTime {
		sequence = (sequence + 1) & 4095
		if sequence == 0 {
			for currentTime <= lastTime {
				currentTime = currentTimeMillis()
			}
		}
	} else {
		sequence = 0
		lastTime = currentTime
	}

	worker.Sequence = sequence
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

---------p

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

var (
	mu        sync.Mutex
	node      *spaceflake.Node
	sequence  uint64
	lastTime  uint64
	baseEpoch uint64 = 1420070400000
	worker    *spaceflake.Worker
)

func currentTimeMillis() uint64 {
	return uint64(time.Now().UnixNano() / int64(time.Millisecond))
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if node == nil {
		node = spaceflake.NewNode(nodeID)
		worker = node.NewWorker()
	}

	currentTime := currentTimeMillis()

	if currentTime == lastTime {
		sequence = (sequence + 1) & 4095
		if sequence == 0 {
			for currentTime <= lastTime {
				currentTime = currentTimeMillis()
			}
		}
	} else {
		sequence = 0
		lastTime = currentTime
	}

	worker.Sequence = sequence
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




------------o

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

var (
	mu        sync.Mutex
	node      *spaceflake.Node
	workers   []*spaceflake.Worker
	sequence  uint64
	lastTime  uint64
	baseEpoch uint64 = 1420070400000
	workerIdx int
)

const (
	numWorkers = 3
)

func currentTimeMillis() uint64 {
	return uint64(time.Now().UnixNano() / int64(time.Millisecond))
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if node == nil {
		node = spaceflake.NewNode(nodeID)
		for i := 0; i < numWorkers; i++ {
			workers = append(workers, node.NewWorker())
		}
	}

	currentWorker := workers[workerIdx]
	workerIdx = (workerIdx + 1) % numWorkers

	currentTime := currentTimeMillis()

	if currentTime == lastTime {
		sequence = (sequence + 1) & 4095
		if sequence == 0 {
			for currentTime <= lastTime {
				currentTime = currentTimeMillis()
			}
		}
	} else {
		sequence = 0
		lastTime = currentTime
	}

	currentWorker.Sequence = sequence
	sf, err := currentWorker.GenerateSpaceflake()
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



------

from locust import HttpUser, task, between, events
from threading import Lock, Thread
from queue import Queue
from datetime import datetime

log_queue = Queue()
file_lock = Lock()

def log_writer():
    while True:
        log_entry = log_queue.get()
        if log_entry is None:
            break
        with file_lock:
            with open(file_name, "a") as file:
                file.write(log_entry)

file_name = f"generated_ids_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
log_thread = Thread(target=log_writer)
log_thread.start()

class SpaceflakeUser(HttpUser):
    wait_time = between(1, 5)  # Wait time between tasks in seconds

    @task
    def generate_spaceflake(self):
        response = self.client.get("/generate", verify=False)
        if response.status_code == 200:
            data = response.json()
            spaceflake_id = data['id']
            log_queue.put(f"{spaceflake_id}\n")

@events.quitting.add_listener
def on_locust_quit(environment, **kwargs):
    log_queue.put(None)
    log_thread.join()

if __name__ == "__main__":
    import os
    os.system("locust -f locustfile.py --host=http://localhost:8080")


---------wait_time



package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/kkrypt0nn/spaceflake"
)

type SpaceflakeResponse struct {
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

var (
	mu        sync.Mutex
	node      *spaceflake.Node
	sequence  uint64
	lastTime  uint64
	baseEpoch uint64 = 1420070400000
	workers   []*spaceflake.Worker
	workerIdx int
)

const (
	numWorkers = 32
)

func currentTimeMillis() uint64 {
	return uint64(time.Now().UnixNano() / int64(time.Millisecond))
}

func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	if node == nil {
		node = spaceflake.NewNode(nodeID)
		for i := 0; i < numWorkers; i++ {
			workers = append(workers, node.NewWorker())
		}
	}

	currentWorker := workers[workerIdx]
	workerIdx = (workerIdx + 1) % numWorkers

	currentTime := currentTimeMillis()

	if currentTime == lastTime {
		sequence = (sequence + 1) & 4095
		if sequence == 0 {
			for currentTime <= lastTime {
				currentTime = currentTimeMillis()
			}
		}
	} else {
		sequence = 0
		lastTime = currentTime
	}

	currentWorker.Sequence = sequence
	sf, err := currentWorker.GenerateSpaceflake()
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

------------else

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/kkrypt0nn/spaceflake"
)

// SpaceflakeResponse represents the response structure for the generated Spaceflake
type SpaceflakeResponse struct {
	ID        string            `json:"id"`
	Decompose map[string]uint64 `json:"decompose"`
}

// Global variables
var (
	mu        sync.Mutex           // Mutex to ensure thread-safe access to shared variables
	node      *spaceflake.Node     // Node object for generating Spaceflakes
	sequence  uint64               // Sequence number for the Spaceflake
	lastTime  uint64               // Timestamp of the last generated Spaceflake
	baseEpoch uint64 = 1420070400000 // Base epoch time
	workers   []*spaceflake.Worker // List of worker objects
	workerIdx int                  // Index to keep track of the current worker
)

const (
	numWorkers = 32 // Number of workers per node
)

// currentTimeMillis returns the current time in milliseconds since the Unix epoch
func currentTimeMillis() uint64 {
	return uint64(time.Now().UnixNano() / int64(time.Millisecond))
}

// generateSpaceflake handles HTTP requests to generate a new Spaceflake
func generateSpaceflake(w http.ResponseWriter, r *http.Request) {
	// Get the NODE_ID environment variable
	nodeIDStr := os.Getenv("NODE_ID")
	nodeIDParts := strings.Split(nodeIDStr, "-")
	nodeID, err := strconv.ParseUint(nodeIDParts[len(nodeIDParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid NODE_ID", http.StatusInternalServerError)
		return
	}

	mu.Lock() // Lock to ensure thread-safe access
	defer mu.Unlock()

	// Initialize the node and workers if they haven't been initialized yet
	if node == nil {
		node = spaceflake.NewNode(nodeID)
		for i := 0; i < numWorkers; i++ {
			worker := node.NewWorker()
			worker.ID = uint64(i % 32) // Ensure worker ID is within the valid range (0-31)
			workers = append(workers, worker)
		}
	}

	// Get the current worker and update the worker index
	currentWorker := workers[workerIdx]
	workerIdx = (workerIdx + 1) % numWorkers

	// Get the current time in milliseconds
	currentTime := currentTimeMillis()

	// Check if the current time is the same as the last time
	if currentTime == lastTime {
		sequence = (sequence + 1) & 4095 // Increment the sequence and wrap around at 4095
		if sequence == 0 {
			// If the sequence wrapped around, wait for the next millisecond
			for currentTime <= lastTime {
				currentTime = currentTimeMillis()
			}
		}
	} else {
		// Reset the sequence for the new millisecond
		sequence = 0
		lastTime = currentTime
	}

	// Set the sequence for the current worker
	currentWorker.Sequence = sequence
	sf, err := currentWorker.GenerateSpaceflake() // Generate the Spaceflake
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Log the creation of the Spaceflake
	log.Printf("Spaceflake created: %s, Decompose: %v", sf.StringID(), sf.Decompose())

	// Create the response
	response := SpaceflakeResponse{
		ID:        sf.StringID(),
		Decompose: sf.Decompose(),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response) // Encode and send the response as JSON
}

func main() {
	http.HandleFunc("/generate", generateSpaceflake) // Set up the HTTP handler
	fmt.Println("Server is listening on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil)) // Start the HTTP server
}
