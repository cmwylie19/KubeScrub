export const URL = 'http://localhost:80'
export const fetchConfig = async () => {
  const response = await fetch(`${URL}/config`);
  const config = await response.json();
  // alert(JSON.stringify(config, null, 2));
  return config;
};

export const fetchConfigMaps = async () => {
  const response = await fetch(`${URL}/scrub/cm`);
  const data = await response.json();
  // alert(JSON.stringify(config, null, 2));
  return data;
};

export const fetchSecrets = async () => {
  const response = await fetch(`${URL}/scrub/secret`);
  const data = await response.json();
  // alert(JSON.stringify(config, null, 2));
  return data;
};

export const fetchServiceAccounts = async () => {
  const response = await fetch(`${URL}/scrub/sa`);
  const data = await response.json();
  // alert(JSON.stringify(config, null, 2));
  return data;
};

export const configHydration = (
  poll,
  interval,
  resources,
  setCM,
  setSecret,
  setSA
) => {
  if (resources.includes("ConfigMap")) {
    fetchConfigMaps().then((data) => {
      setCM(data);
    });
  }
  if (resources.includes("Secret")) {
    fetchSecrets().then((data) => {
      setSecret(data);
    });
  }
  if (resources.includes("ServiceAccount")) {
    fetchServiceAccounts().then((data) => {
      setSA(data);
    });
  }
  if (poll) {
    setInterval(() => {
      if (resources.includes("ConfigMap")) {
        fetchConfigMaps().then((data) => {
          setCM(data);
        });
      }
      if (resources.includes("Secret")) {
        fetchSecrets().then((data) => {
          setSecret(data);
        });
      }
      if (resources.includes("ServiceAccount")) {
        fetchServiceAccounts().then((data) => {
          setSA(data);
        });
      }
    }, 3 * 1000);
  }
};
