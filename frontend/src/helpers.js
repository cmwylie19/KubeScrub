export const fetchConfig = async () => {
    const response = await fetch('http://localhost:8080/config');
    const config = await response.json();
    alert(JSON.stringify(config, null, 2));
    return config;
}
