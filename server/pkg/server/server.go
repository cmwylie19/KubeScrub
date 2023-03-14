package server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/cmwylie19/kubescrub/pkg/utils"
	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const NAMESPACE = "default"

type Server struct {
	Port         string                `json:"port"`
	Key          string                `json:"key"`
	Cert         string                `json:"cert"`
	Watch        []string              `json:"watch"`
	ReadOnly     bool                  `json:"read-only"`
	Poll         bool                  `json:"poll"`
	PollInterval int                   `json:"poll-interval"`
	Namespaced   bool                  `json:"namespaced"`
	Namespaces   []string              `json:"namespaces"`
	Namespace    string                `json:"namespace"`
	Password     string                `json:"password"`
	Theme        string                `json:"theme"`
	ClientSet    *kubernetes.Clientset `json:"clientset"`
	ConfigMaps   *[]v1.ConfigMap       `json:"configmaps"`
	Secrets      *[]v1.Secret          `json:"secrets"`
}

func (s *Server) Start() {
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err.Error())
	}
	// creates the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("Clientset: %T", clientset)
	s.ClientSet = clientset
}

func EnableCors(f http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		f(w, r)
	}
}

func (s *Server) GetPods(ns string) *v1.PodList {
	pods, err := s.ClientSet.CoreV1().Pods(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		utils.Logger.Error("Error getting pods", zap.Error(err))
		panic(err.Error())
	}
	return pods
}

func (s *Server) GetCMs(ns string) *v1.ConfigMapList {
	cms, err := s.ClientSet.CoreV1().ConfigMaps(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		utils.Logger.Error("Error getting cm's", zap.Error(err))
		panic(err.Error())
	}
	return cms
}

func (s *Server) GetSVCs(ns string) *v1.ServiceList {
	svcs, err := s.ClientSet.CoreV1().Services(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		utils.Logger.Error("Error getting svc's", zap.Error(err))
		panic(err.Error())
	}
	return svcs
}

func (s *Server) GetSAs(ns string) *v1.ServiceAccountList {
	sas, err := s.ClientSet.CoreV1().ServiceAccounts(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		utils.Logger.Error("Error getting service accounts", zap.Error(err))
		panic(err.Error())
	}
	return sas
}

func (s *Server) GetSecrets(ns string) *v1.SecretList {

	secrets, err := s.ClientSet.CoreV1().Secrets(ns).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		utils.Logger.Error("Error getting secrets", zap.Error(err))
		panic(err.Error())
	}
	return secrets
}

// Orphaned ConfigMaps are configmaps not associated with a pod
func (s *Server) CMHandler(w http.ResponseWriter, r *http.Request) {
	utils.Logger.Info("CM Handler")
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// get pods in all namespaces
	pods := s.GetPods("default")

	// get configmaps in all namespaces
	cms := s.GetCMs("default")
	// find which configmaps are not referenced in pods
	for i, val := range cms.Items {
		// exists in podsList
		exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "configmap") == true
		// repurpose some field on CM
		cms.Items[i].Annotations["exists"] = strconv.FormatBool(exists)
	}

	fmt.Printf("PODS: %+v\n", pods)
	fmt.Printf("CMs: %+v\n", cms)

	// find scrub assets

	json.NewEncoder(w).Encode(cms)
}

// Orphaned Secrets are secrets not associated with a pod, service, or service account
func (s *Server) SecretHandler(w http.ResponseWriter, r *http.Request) {
	utils.Logger.Info("Secret Handler")
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// // get pods in all namespaces
	pods := s.GetPods("default")

	// get secrets in all namespaces
	secrets := s.GetSecrets("default")
	// find which configmaps are not referenced in pods
	fmt.Printf("%+v", secrets)
	for _, val := range secrets.Items {
		// exists in podsList
		exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "secret") == true
		// repurpose some field on CM
		val.Annotations["exists"] = strconv.FormatBool(exists)
	}

	// find scrub assets

	json.NewEncoder(w).Encode(secrets)
}

// Orphaned Services are services not associated with a pod
func (s *Server) ServiceHandler(w http.ResponseWriter, r *http.Request) {
	utils.Logger.Info("Service Handler")
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	utils.Logger.Info("Scrubbing Kubernetes Cluster")

	// find scrub assets

	json.NewEncoder(w).Encode(s)
}

// Orphaned Service Accounts are service accounts not associated with a pod, clusterrolebinding, or rolebinding
func (s *Server) ServiceAccountHandler(w http.ResponseWriter, r *http.Request) {
	utils.Logger.Info("Service Account Handler")
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

func (s *Server) Serve(key, cert, port string, watch []string, poll, readOnly bool, pollInterval int, namespaced bool, namespaces []string, theme, password, namespace string) error {
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
	s.Namespace = namespace
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
