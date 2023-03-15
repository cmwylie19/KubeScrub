package server

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/cmwylie19/kubescrub/pkg/utils"
	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const NAMESPACE = "default"

type KubernetesObject struct {
	Kind      string `json:"kind"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Exists    bool   `json:"exists"`
}
type Server struct {
	Port         string                `json:"port"`
	Key          string                `json:"key"`
	Cert         string                `json:"cert"`
	Watch        []string              `json:"watch"`
	Poll         bool                  `json:"poll"`
	PollInterval int                   `json:"poll-interval"`
	Namespaces   []string              `json:"namespaces"`
	Theme        string                `json:"theme"`
	ClientSet    *kubernetes.Clientset `json:"clientset"`
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
	cm_list := []KubernetesObject{}
	utils.Logger.Info("CM Handler")
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	// for each namespace
	if len(s.Namespaces) > 0 {
		for _, ns := range s.Namespaces {

			// get pods in all namespaces
			pods := s.GetPods(ns)

			// get configmaps in all namespaces
			cms := s.GetCMs(ns)

			for _, val := range cms.Items {
				// make educated guess which configmaps are not referenced in pods
				// if name of the configmap is in the pod spec, and the pod spec contains the word configmap, then it is referenced
				exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "configmap") == true

				cm_list = append(cm_list, KubernetesObject{Kind: "ConfigMap", Name: val.Name, Namespace: val.Namespace, Exists: exists})
			}
		}
	} else {
		pods := s.GetPods("")

		// get configmaps in all namespaces
		cms := s.GetCMs("")

		for _, val := range cms.Items {
			// make educated guess which configmaps are not referenced in pods
			// if name of the configmap is in the pod spec, and the pod spec contains the word configmap, then it is referenced
			exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "configmap") == true

			cm_list = append(cm_list, KubernetesObject{Kind: "ConfigMap", Name: val.Name, Namespace: val.Namespace, Exists: exists})
		}
	}

	json.NewEncoder(w).Encode(cm_list)
}

// Orphaned Secrets are secrets not associated with a pod (service account ignored)
func (s *Server) SecretHandler(w http.ResponseWriter, r *http.Request) {
	secret_list := []KubernetesObject{}
	utils.Logger.Info("Secret Handler")
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	if len(s.Namespaces) > 0 {
		for _, ns := range s.Namespaces {
			// // get pods in all namespaces
			pods := s.GetPods(ns)

			// get secrets in all namespaces
			secrets := s.GetSecrets(ns)

			// make guess which secrets are not referenced in pods

			for _, val := range secrets.Items {
				// make educated guess which secrets are not referenced in pods
				// if name of the secret is in the pod spec, and the pod spec contains the word secret, then it is referenced
				exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "secret") == true

				secret_list = append(secret_list, KubernetesObject{Kind: "Secret", Name: val.Name, Namespace: val.Namespace, Exists: exists})
			}
		}
	} else {
		pods := s.GetPods("")

		// get secrets in all namespaces
		secrets := s.GetSecrets("")

		// make guess which secrets are not referenced in pods

		for _, val := range secrets.Items {
			// make educated guess which secrets are not referenced in pods
			// if name of the secret is in the pod spec, and the pod spec contains the word secret, then it is referenced
			exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "secret") == true

			secret_list = append(secret_list, KubernetesObject{Kind: "Secret", Name: val.Name, Namespace: val.Namespace, Exists: exists})
		}
	}
	json.NewEncoder(w).Encode(secret_list)
}

// Orphaned Service Accounts are service accounts not associated with a pod, (clusterrolebinding, or rolebinding are ignored)
func (s *Server) ServiceAccountHandler(w http.ResponseWriter, r *http.Request) {
	sa_list := []KubernetesObject{}
	utils.Logger.Info("Service Account Handler")
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")

	if len(s.Namespaces) > 0 {
		for _, ns := range s.Namespaces {
			// get pods in all namespaces
			pods := s.GetPods(ns)
			// get secrets in all namespaces
			sas := s.GetSAs(ns)

			for _, val := range sas.Items {
				// make educated guess which sa are not referenced in pods
				// if name of the sa is in the pod spec, and the pod spec contains the word sa, then it is referenced
				exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "serviceaccount") == true

				sa_list = append(sa_list, KubernetesObject{Kind: "ServiceAccount", Name: val.Name, Namespace: val.Namespace, Exists: exists})

			}
		}
	} else {
		pods := s.GetPods("")
		// get secrets in all namespaces
		sas := s.GetSAs("")

		for _, val := range sas.Items {
			// make educated guess which sa are not referenced in pods
			// if name of the sa is in the pod spec, and the pod spec contains the word sa, then it is referenced
			exists := strings.Contains(fmt.Sprintf("%#v", pods), val.Name) == true && strings.Contains(strings.ToLower(fmt.Sprintf("%#v", pods)), "serviceaccount") == true

			sa_list = append(sa_list, KubernetesObject{Kind: "ServiceAccount", Name: val.Name, Namespace: val.Namespace, Exists: exists})

		}
	}

	json.NewEncoder(w).Encode(sa_list)
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

func (s *Server) Serve(key, cert, port string, watch []string, poll bool, pollInterval int, namespaces []string, theme string) error {
	fmt.Println(watch)

	s.Port = port
	s.Key = key
	s.Cert = cert
	s.Watch = watch
	s.Poll = poll

	s.PollInterval = pollInterval
	s.Namespaces = namespaces
	s.Theme = theme

	http.HandleFunc("/", EnableCors(HealthCheckHandler))
	http.HandleFunc("/config", EnableCors(s.ConfigHandler))
	http.HandleFunc("/scrub/cm", EnableCors(s.CMHandler))
	http.HandleFunc("/scrub/secret", EnableCors(s.SecretHandler))
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
