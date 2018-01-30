var LssClient = function ($) {
    var defaultExtension = '.doc';
    var usingByPass = false;
    var defaultTimeout = 0;
    var checkLssConnectivityTimeout = 10000;
    
    YokuServiceClient = function () {
        $.support.cors = true;
        var httpBaseUrl = "http://127.0.0.1:61111/webhost";
        var sslBaseUrl = "https://127.0.0.1:61112/webhost";
        var POST = 'POST';
        
        function post(type, data, timeout) {
            return $.ajax({
                url: createUrl(POST, type),
                type: POST,
                data: JSON.stringify(data),
                contentType: "application/json",
                crossDomain: true,
                processData: false,
                dataType: "json",
                timeout: timeout
            });
        }

        function createUrl(methodName, type) {
            return getBaseUrl() + '/' + methodName + '?' + 'type' + '=' + type;
        }

        function getBaseUrl() {
            return window.location.protocol == "https:" ? sslBaseUrl : httpBaseUrl;
        }

        return {
            post: post
        };
    }

    function HeartBeatRequest() {
        var self = this;
        self.taskType = 'SystemStateTask';
        self.Payload = 'CheckLssPresence';
    }

    function SignRequest(data, certificate) {
        var self = this;
        self.taskType = 'SignTask';
        self.DataToSign = data;
        self.SignCertificate = certificate;
    }

    function SignVerificationRequest(signedData, originalData) {
        var self = this;
        self.taskType = 'VerifyTask';
        self.SignedData = signedData;
        self.OriginalData = originalData;
    }
    
    function EncryptionRequest(data, certificates) {
        var self = this;
        self.taskType = 'EncryptTask';
        self.DataToEncrypt = data;
        self.Certificates = certificates;
    }
    
    function DecryptionRequest(data) {
        var self = this;
        self.taskType = 'DecryptTask';
        self.EncryptedData = data;
    }

    function SignAndEncryptionRequest(data, certificates, signCertificate) {
        var self = this;
        self.taskType = 'SignAndEncryptTask';
        self.DataToSignAndEncrypt = data;
        self.Certificates = certificates;
        self.SignCertificate = signCertificate;
    }
    
    function DecryptAndVerifySignRequest(data, certificate) {
        var self = this;
        self.taskType = 'DecryptAndVerifyTask';
        self.EnctyptedDataAndSign = data;
    }
    
    function SelectCertificateRequest() {
        var self = this;
        self.taskType = 'SelectCertificateTask';
    }

    function HashRequest() {
        var self = this;
        self.taskType = 'HashTask';
    }
    
    function CertificateRequestMessage(subject, extendedKeyUsages) {
        var self = this;
        self.taskType = 'CreateCertificateRequestTask';
        self.Subject = subject;
        self.ExtendedKeyUsages = extendedKeyUsages;
    }

    function InstallCertificateIssuedByRequestMessage(certificate) {
        var self = this;
        self.taskType = 'InstallCertificateIssuedByRequestTask';
        self.Certificate = certificate;
    }
    
    function generateGuid() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }


    function sendRequest(task, timeout) {
        var client = new YokuServiceClient();
        if (usingByPass) {
            task.ByPassVisualization = true;
        }
        return client.post(task.taskType, task, timeout);
    }

    function installCertificateIssuedByRequest(options) {
        var defaultOptions = {
            requestId: generateGuid()
        };

        options = $.extend(defaultOptions, options);

        var task = new InstallCertificateIssuedByRequestMessage(options.certificate);
        task.RequestId = defaultOptions.requestId;
        return sendRequest(task, defaultTimeout);
    }
    
    function generateCertificateRequest(options) {
        var defaultOptions = {
            requestId: generateGuid()
        };

        options = $.extend(defaultOptions, options);

        var task = new CertificateRequestMessage(
            options.subject,
            options.extendedKeyUsages);
        task.RequestId = defaultOptions.requestId;
        return sendRequest(task, defaultTimeout);
    }

    function sign (options) {
        
        var defaultOptions = {
            base64Data : '-',
            description: 'Описание не задано',
            documentName: 'Подпись',
            fileExtension : defaultExtension,
            isAttached: true,
            base64Certificate: '-',
            disableCertificateVerification: false,
            requestId: generateGuid()
        };

        options = $.extend(defaultOptions, options);

        var task = new SignRequest(defaultOptions.base64Data, defaultOptions.base64Certificate);
        task.IsAttached = defaultOptions.isAttached;
        task.DocumentName = defaultOptions.documentName;
        task.Description = defaultOptions.description;
        task.ViewDescriptor = { FileExtension: defaultOptions.fileExtension };
        task.RequestId = defaultOptions.requestId;
        task.TspServerUrl = defaultOptions.tspServerUrl;
        task.TspServerTimeoutInMilliseconds = parseInt(defaultOptions.tspServerTimeout);
        task.DisableCertificateVerification = defaultOptions.disableCertificateVerification;

        return sendRequest(task, defaultTimeout);
    }

    function verifySign(options) {
        var defaultOptions = {
            base64Data: '-',
            base64DataWithoutSign: '-',
            isAttached: true,
            description: 'Описание не задано',
            documentName: 'Проверка подписи',
            fileExtension: defaultExtension,
            requestId: generateGuid()
        };

        options = $.extend(defaultOptions, options);

        var task = new SignVerificationRequest(defaultOptions.base64Data, defaultOptions.base64DataWithoutSign);
        task.IsAttached = defaultOptions.isAttached;
        task.DocumentName = defaultOptions.documentName;
        task.Description = defaultOptions.description;
        task.ViewDescriptor = { FileExtension: defaultOptions.fileExtension };
        task.RequestId = defaultOptions.requestId;

        return sendRequest(task, defaultTimeout);
    }

    function encrypt (options) {
        var defaultOptions = {
            base64Data: '-',
            base64Certificates: [],
            description: 'Описание не задано',
            documentName: 'Шифрование',
            fileExtension: defaultExtension,
            disableCertificateVerification: false,
            requestId: generateGuid()
        };

        options = $.extend(defaultOptions, options);
        
        var task = new EncryptionRequest(defaultOptions.base64Data, defaultOptions.base64Certificates);
        task.DocumentName = defaultOptions.documentName;
        task.Description = defaultOptions.description;
        task.ViewDescriptor = { FileExtension: defaultOptions.fileExtension };
        task.DisableCertificateVerification = defaultOptions.disableCertificateVerification;
        task.RequestId = defaultOptions.requestId;

        return sendRequest(task, defaultTimeout);
    }
    
    function decrypt(options) {
        var defaultOptions = {
            base64Data: '-',
            description: 'Описание не задано',
            documentName: 'Расшифрование',
            fileExtension: defaultExtension,
            disableCertificateVerification: false,
            requestId: generateGuid()
        };
        
        options = $.extend(defaultOptions, options);
        var task = new DecryptionRequest(defaultOptions.base64Data);
        task.DocumentName = defaultOptions.documentName;
        task.Description = defaultOptions.description;
        task.ViewDescriptor = { FileExtension: defaultOptions.fileExtension };
        task.DisableCertificateVerification = defaultOptions.disableCertificateVerification;
        task.RequestId = defaultOptions.requestId;

        return sendRequest(task, defaultTimeout);
    }

    function signAndEncrypt(options) {
        var defaultOptions = {
            base64Data: '-',
            base64Certificates: [],
            description: 'Описание не задано',
            documentName: 'Подпись и шифрование',
            fileExtension: defaultExtension,
            base64SignCertificate: '-',
            disableCertificateVerification: false,
            requestId: generateGuid()
        };
        
        options = $.extend(defaultOptions, options);
        var task = new SignAndEncryptionRequest(defaultOptions.base64Data, defaultOptions.base64Certificates, defaultOptions.base64SignCertificate);
        task.DocumentName = defaultOptions.documentName;
        task.Description = defaultOptions.description;
        task.ViewDescriptor = { FileExtension: defaultOptions.fileExtension };
        task.TspServerUrl = defaultOptions.tspServerUrl;
        task.TspServerTimeoutInMilliseconds = parseInt(defaultOptions.tspServerTimeout);
        task.DisableCertificateVerification = defaultOptions.disableCertificateVerification;
        task.RequestId = defaultOptions.requestId;

        return sendRequest(task, defaultTimeout);
    }
    
    function decryptAndVerifySign(options) {
        var defaultOptions = {
            base64Data: '-',
            description: 'Описание не задано',
            documentName: 'Расшифрование и проверка подписи',
            fileExtension: defaultExtension,
            disableCertificateVerification: false,
            requestId: generateGuid()
        };

        options = options = $.extend(defaultOptions, options);
        var task = new DecryptAndVerifySignRequest(defaultOptions.base64Data);
        task.DocumentName = defaultOptions.documentName;
        task.Description = defaultOptions.description;
        task.ViewDescriptor = { FileExtension: defaultOptions.fileExtension };
        task.DisableCertificateVerification = defaultOptions.disableCertificateVerification;
        task.RequestId = defaultOptions.requestId;

        return sendRequest(task, defaultTimeout);
    }

    function selectCertificate(options) {
        var defaultOptions = {
            disableCertificateVerification: false,
            requestId: generateGuid()
        };
        options = $.extend(defaultOptions, options);
        var task = new SelectCertificateRequest();
        task.DisableCertificateVerification = defaultOptions.disableCertificateVerification;
        task.RequestId = defaultOptions.requestId;
        
        return sendRequest(task, defaultTimeout);
    }

    function hash(options) {
        var defaultOptions = {
            requestId: generateGuid()
        };
        options = $.extend(defaultOptions, options);
        var task = new HashRequest();
        task.RequestId = defaultOptions.requestId;
        task.DataToHash = defaultOptions.base64Data;

        return sendRequest(task, defaultTimeout);
    }
    
    function checkLssConnectivity() {
        var task = new HeartBeatRequest();
        return sendRequest(task, checkLssConnectivityTimeout);
    }

    function withBypass() {
        usingByPass = true;
        return this;
    }

    return {
        sign: sign,
        verifySign: verifySign,
        encrypt: encrypt,
        decrypt: decrypt,
        signAndEncrypt: signAndEncrypt,
        decryptAndVerifySign: decryptAndVerifySign,
        selectCertificate: selectCertificate,
        checkConnection: checkLssConnectivity,
        withBypass: withBypass,
        generateCertificateRequest: generateCertificateRequest,
        installCertificateIssuedByRequest: installCertificateIssuedByRequest,
        hash: hash
    }
}