function retrieveCertsAndOpenDialog_Async(callback)
{
	cadesplugin.async_spawn(function *(arg) {
		var errorMessage = "";
		try
		{
			var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.store");
			yield oStore.Open();
		}
		catch(e)
		{
			errorMessage = "Failed to create CAPICOM.store " + GetErrorMessage(e);
            throw errorMessage;
		}
    	var certAmount;
    	var certObjects;
        try 
        {
            certObjects = yield oStore.Certificates;
            certAmount = yield certObjects.Count;
        }
        catch (e) 
        {
            errorMessage = "Failed to acquire access to certificate storage: " + GetErrorMessage(e);
            throw errorMessage;
        }

        window.availableCertificatesAmount = certAmount;
        if(certAmount == 0)
        {
        	errorMessage = "Available certificates are absent.";
            throw errorMessage;
        }
        if(certAmount == 1)
        {
        	window.availableCertificatesAmount = 1;
        	window.selectedCertificateId = 1;
        	return;
        }

        var array = [];
        for(var i = 1; i < certAmount + 1; i++)
        {
        	var currentCert = yield certObjects.Item(i);
        	var name = yield currentCert.SubjectName;
        	var issuer = yield currentCert.IssuerName;
        	var validFrom = new Date((yield currentCert.ValidFromDate));
        	var validTo = new Date((yield currentCert.ValidToDate));

        	array.push({certName: window.getCertSubjectValue(name), issuerName: window.getCertSubjectValue(issuer), validFromDate: window.getDateString(validFrom), validToDate: window.getDateString(validTo)});
        }	        
        yield oStore.Close();
        window.openSelectDialogWindow(arg[0], array);
	}, callback); //cadesplugin.async_spawn
}

function signData_Async(certId, data, thisObject, checkSignState, appeal, isEditSign)
{
	cadesplugin.async_spawn(function*(arg){
		var errorMessage = "";

		var certificateId = arg[0];
		var dataToSign = arg[1];
		var thisObject = arg[2];
		var checkSignState = arg[3];
		var appeal = arg[4];
		var isEditSign = arg[5];

		if(certificateId < 1)
		{
			errorMessage = "Certificate is not selected.";
			throw errorMessage;
		}

		try
		{
			var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.store");
        	yield oStore.Open();
    	} 
    	catch (e) 
    	{
    		errorMessage = "Failed to create CAPICOM.store: " + GetErrorMessage(e);
    		throw errorMessage;
    	}

		var certs = yield oStore.Certificates;
		var certificate = yield certs.Item(certificateId);

		try
		{
			var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
			var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
		}
		catch(e)
		{
			errorMessage = "Failed to create CAdESCOM.CPSigner or CadesSignedData:" + GetErrorMessage(e);
			throw errorMessage;
		}

		if (oSigner) 
		{
    		oSigner.propset_Certificate(certificate);
		}
		else 
		{
			errorMessage = "CPSigner is null. Cannot proceed!";
    		return;
		}

		if(dataToSign)
		{
			var CADES_BES = 1;
			oSignedData.propset_Content(dataToSign);
			oSigner.propset_Options(1); //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN
			try
			{
				var sSignedData = yield oSignedData.SignCades(oSigner, CADES_BES);
			}
			catch(err)
			{
				errorMessage = "Can't create signature due to error: " + GetErrorMessage(err);
				throw errorMessage;
			}
			if(sSignedData == null)
			{
				return;
			}
			if(isEditSign)
			{
				window.editSignAndState(thisObject, sSignedData, checkSignState, appeal);
			}
			else
			{
				window.createCKChangeState(thisObject, sSignedData);
			}
		}

	}, certId, data, thisObject, checkSignState, appeal, isEditSign); //cadesplugin.async_spawn
}