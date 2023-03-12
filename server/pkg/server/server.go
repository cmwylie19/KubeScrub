package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/cmwylie19/kubescrub/pkg/utils"
	"go.uber.org/zap"
)

type Server struct {
	Port         string   `json:"port"`
	Key          string   `json:"key"`
	Cert         string   `json:"cert"`
	Watch        []string `json:"watch"`
	ReadOnly     bool     `json:"read-only"`
	Poll         bool     `json:"poll"`
	PollInterval int      `json:"poll-interval"`
	Namespaced   bool     `json:"namespaced"`
	Namespaces   []string `json:"namespaces"`
	Password     string   `json:"password"`
	Theme        string   `json:"theme"`
}

func EnableCors(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		f(w, r)
	}
}
func (s *Server) CMHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	utils.Logger.Info("Scrubbing Kubernetes Cluster")

	// find scrub assets

	json.NewEncoder(w).Encode(s)
}

// Orphaned Secrets are secrets not associated with a pod, service, or service account
func (s *Server) SecretHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	utils.Logger.Info("Scrubbing Kubernetes Cluster")

	// find scrub assets

	json.NewEncoder(w).Encode(s)
}

// Orphaned Services are services not associated with a pod
func (s *Server) ServiceHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	utils.Logger.Info("Scrubbing Kubernetes Cluster")

	// find scrub assets

	json.NewEncoder(w).Encode(s)
}

// Orphaned Service Accounts are service accounts not associated with a pod, clusterrolebinding, or rolebinding
func (s *Server) ServiceAccountHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	utils.Logger.Info("Scrubbing Kubernetes Cluster")

	// find scrub assets

	json.NewEncoder(w).Encode(s)
}
func (s *Server) ConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	utils.Logger.Info("Sending Frontend Config")
	json.NewEncoder(w).Encode(s)
}
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	if os.Getenv("ENV") != "CI" {
		utils.Logger.Info("Health check Endpoint", zap.String("status", "OK"))
	}

	io.WriteString(w, `{"alive": true}`)
}

func (s *Server) Serve(key, cert, port string, watch []string, poll, readOnly bool, pollInterval int, namespaced bool, namespaces []string, theme, password string) error {
	fmt.Println(watch)

	s.Port = port
	s.Key = key
	s.Cert = cert
	s.Watch = watch
	s.Poll = poll
	s.ReadOnly = readOnly
	s.PollInterval = pollInterval
	s.Namespaced = namespaced
	s.Namespaces = namespaces
	s.Theme = theme
	s.Password = password

	http.HandleFunc("/", EnableCors(HealthCheckHandler))
	http.HandleFunc("/config", EnableCors(s.ConfigHandler))
	http.HandleFunc("/scrub/cm", EnableCors(s.CMHandler))
	http.HandleFunc("/scrub/secret", EnableCors(s.SecretHandler))
	http.HandleFunc("/scrub/svc", EnableCors(s.ServiceHandler))
	http.HandleFunc("/scrub/sa", EnableCors(s.ServiceAccountHandler))

	if key == "" || cert == "" {
		utils.Logger.Info("Server started", zap.String("port", s.Port))
		err := http.ListenAndServe(":"+s.Port, nil)
		if err != nil {
			return err
		}
		return nil
	} else {
		err := http.ListenAndServeTLS(":"+s.Port, s.Cert, s.Key, nil)
		if err != nil {
			return err
		}
		return nil
	}

	return nil
}
