package server

import "net/http"

type Server struct {
	Port string `json:"port"`
	Key  string `json:"key"`
	Cert string `json:"cert"`
}

func (s *Server) Serve(key, cert, port string) error {
	s.Port = port
	s.Key = key
	s.Cert = cert

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, world!"))
	})

	if key == "" || cert == "" {
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
