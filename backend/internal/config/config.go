// Package config reads the small amount of runtime configuration the service
// needs from the environment.
package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

// DefaultPort is used when PORT is unset or invalid.
const DefaultPort = 8080

// Port returns the TCP port from PORT, falling back to DefaultPort.
func Port() int {
	raw := os.Getenv("PORT")
	if raw == "" {
		return DefaultPort
	}
	port, err := strconv.Atoi(raw)
	if err != nil || port < 1 || port > 65535 {
		log.Printf("ignoring invalid PORT %q; using %d", raw, DefaultPort)
		return DefaultPort
	}
	return port
}

// Addr returns the TCP listen address, for example ":8080".
func Addr() string {
	return fmt.Sprintf(":%d", Port())
}
