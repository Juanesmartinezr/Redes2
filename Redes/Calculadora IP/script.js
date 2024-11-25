function analyzeIP() {
    const input = document.getElementById('ipInput').value;
    clearPreviousOutput();

    if (!input) {
        showErrorMessage('Please enter an IP address.');
        return;
    }

    const { ip, mask } = parseInput(input);
    if (!ip) {
        showErrorMessage('Invalid IP address format. Please enter a valid IP address with or without a mask.');
        return;
    }

    const ipParts = ip.split('.').map(Number);
    if (!validateOctets(ipParts)) {
        showErrorMessage('Invalid IP address. Each octet must be between 0 and 255.');
        return;
    }

    const ipClass = getIPClass(ipParts[0]);
    const ipType = getIPType(ipParts);
    const subnetMask = mask ? calculateSubnetMask(mask) : null;
    const ipBinary = calculateIPBinary(ipParts);

    displayResults(ipParts, subnetMask, ipClass, ipType, ipBinary, mask);
}

// Función para limpiar el contenido anterior
function clearPreviousOutput() {
    const elementsToClear = [
        'output', 'errorMessage', 'usableHosts', 'binaryIP', 
        'networkAddress', 'broadcastAddress', 'ipClass', 
        'ipType', 'usableHostsCount'
    ];
    elementsToClear.forEach(id => document.getElementById(id).innerHTML = '');
    document.getElementById('colorLegend').style.display = 'none';
}

// Función para mostrar el mensaje de error
function showErrorMessage(message) {
    document.getElementById('errorMessage').innerHTML = message;
}

// Función para parsear el input
function parseInput(input) {
    const regexWithMask = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
    const regexWithoutMask = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (regexWithMask.test(input)) {
        const [ip, mask] = input.split('/');
        return { ip, mask: parseInt(mask) };
    } else if (regexWithoutMask.test(input)) {
        return { ip: input, mask: null };
    }
    return { ip: null, mask: null };
}

// Función para validar los octetos
function validateOctets(ipParts) {
    return ipParts.every(part => part >= 0 && part <= 255);
}

// Función para determinar la clase de la IP
function getIPClass(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) return 'Class A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'Class B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Class C';
    return '';
}

// Función para determinar si la IP es pública o privada
function getIPType(ipParts) {
    if ((ipParts[0] === 10) ||
        (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
        (ipParts[0] === 192 && ipParts[1] === 168)) {
        return 'Private IP';
    }
    return 'Public IP';
}

// Función para calcular la máscara de subred
function calculateSubnetMask(mask) {
    return (2 ** mask - 1) << (32 - mask);
}

// Función para calcular el valor binario de la IP
function calculateIPBinary(ipParts) {
    return ipParts.map(part => part.toString(2).padStart(8, '0')).join('.');
}

// Función para mostrar los resultados
function displayResults(ipParts, subnetMask, ipClass, ipType, ipBinary, maskInt) {
    const ipBinaryInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const networkAddress = subnetMask ? (ipBinaryInt & subnetMask) : ipBinaryInt;
    const broadcastAddress = subnetMask ? (networkAddress | ~subnetMask >>> 0) : ipBinaryInt;

    const netParts = [
        (networkAddress >>> 24) & 255,
        (networkAddress >>> 16) & 255,
        (networkAddress >>> 8) & 255,
        networkAddress & 255
    ];
    const broadcastParts = [
        (broadcastAddress >>> 24) & 255,
        (broadcastAddress >>> 16) & 255,
        (broadcastAddress >>> 8) & 255,
        broadcastAddress & 255
    ];

    document.getElementById('networkAddress').innerHTML = `<strong>Network Address:</strong> ${netParts.join('.')}`;
    document.getElementById('broadcastAddress').innerHTML = `<strong>Broadcast Address:</strong> ${broadcastParts.join('.')}`;
    document.getElementById('ipClass').innerHTML = `<strong>IP Class:</strong> ${ipClass}`;
    document.getElementById('ipType').innerHTML = `<strong>IP Type:</strong> ${ipType}`;
    document.getElementById('binaryIP').innerHTML = `<strong>IP in Binary:</strong> ${ipBinary}`;

    // Calcular el número de hosts y las direcciones utilizables
    if (subnetMask && maskInt) {
        const firstUsableHost = networkAddress + 1;
        const lastUsableHost = broadcastAddress - 1;
        const usableHosts = (2 ** (32 - maskInt)) - 2;
        document.getElementById('usableHosts').innerHTML = `
            <strong>Usable IP Addresses:</strong> ${formatIP(firstUsableHost)} - ${formatIP(lastUsableHost)}
        `;
        document.getElementById('usableHostsCount').innerHTML = `<strong>Number of Usable Hosts:</strong> ${usableHosts}`;
    }

    // Mostrar contenedor de salida y leyenda de colores
    document.getElementById('outputContainer').style.display = 'block';
    document.getElementById('colorLegend').style.display = 'flex';
}

// Función auxiliar para formatear IP en entero a formato IP
function formatIP(ipInt) {
    return `${(ipInt >>> 24) & 255}.${(ipInt >>> 16) & 255}.${(ipInt >>> 8) & 255}.${ipInt & 255}`;
}
