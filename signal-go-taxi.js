App.service('signalGo', function () {
  var currentService = this;
  /* service connection status:
      0: not connected
      1: connected
      2: trying to connect
  */
  this.status = 0;

  /*
    this arrays is for provider callbacks:
    if the service is not connected, the callback funcs stores in arrays and
    after connecting provider, sets the provider callbacks
  */
  this.observersNotifyServerConnected = [];
  this.observersServerStatusChanged = [];
  this.observersNotifyAddedService = [];
  this.observersNotifyCancelService = [];
  this.observersNotifySuccessService = [];
  this.observersOnServiceStatusChanged = [];
  ///map-controller
  this.observersNotifyDriverLocation = [];
  this.observersNotifyDriverStatus = [];


  // currecnt service functions
  ///request-service
  this.connectToServer = connectToServer;
  this.notifyServerConnected = notifyServerConnected;
  this.notifyServerStatusChanged = notifyServerStatusChanged;
  this.notifyAddedService = notifyAddedService;
  this.notifyCancelService = notifyCancelService;
  this.notifySuccessService = notifySuccessService;
  this.notifyServiceStatusChanged = notifyServiceStatusChanged;
  ///map-controller
  this.notifyDriverLocation = notifyDriverLocation;
  this.notifyDriverStatus = notifyDriverStatus;

  ///request-service
  /*
    func is a function
    when a server connected, server call the argument func
  */
  function notifyServerConnected(func) {
    this.observersNotifyServerConnected.push(func);
  }
  /*
    func is a function
    when a server status changed, server call the argument func
  */
  function notifyServerStatusChanged(func) {
    this.observersServerStatusChanged.push(func);
  }
  /*
    func is a function
    when a new service requessted in server, server call the argument func
  */
  function notifyAddedService(func) {
    this.observersNotifyAddedService.push(func);
  }
  /*
    func is a function
    when a service request not set to this agency, server call the argument func
  */
  function notifyCancelService(func) {
    this.observersNotifyCancelService.push(func);
  }
  /*
    func is a function
    when a service request set to this agency, server call the argument func
  */
  function notifySuccessService(func) {
    this.observersNotifySuccessService.push(func);
  }
  /*
   func is a function
   when a driver location on map changed notify to agency, server call the argument func
  */
  function notifyDriverLocation(func) {
    this.observersNotifyDriverLocation.push(func);
  }
  /*
  func is a function
  when a driver status changed notify to agency, server call the argument func
  */
  function notifyDriverStatus(func) {
    this.observersNotifyDriverStatus.push(func);
  }

  function notifyServiceStatusChanged(func) {
    this.observersOnServiceStatusChanged.push(func);
  }

  function connectToServer(onSuccessCallback, onErrorCallback, onCloseCallback) {
    if (currentService.status == 1) return;
    currentService.provider = new ClientProvider();
    currentService.status = 2;
    for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
      currentService.observersServerStatusChanged[i](currentService.status);
    }

    // connect to server
    currentService.provider.Connect('ws://' + sysConfig.urlIP + ':' + sysConfig.urlPort + '/TransportServices/SignalGo', currentService.provider,
      function () { // on success connect
        currentService.provider.RegisterService("TransportService", function (myService) {
          currentService.service = myService;
          currentService.status = 1;
          if (onSuccessCallback) onSuccessCallback();
          for (var i = 0; i < currentService.observersNotifyServerConnected.length; i++) {
            currentService.observersNotifyServerConnected[i]();
          }
          for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
            currentService.observersServerStatusChanged[i](currentService.status);
          }
        });

        currentService.providerCallback = currentService.provider.RegisterCallbackService("TransportServiceCallback");

        //callback function call from server
        /* service */
        currentService.providerCallback.NotifyAddedService = function (serviceInfo, discountInfo) {
          for (var i = 0; i < currentService.observersNotifyAddedService.length; i++) {
            currentService.observersNotifyAddedService[i](serviceInfo, discountInfo);
          }
        }
        currentService.providerCallback.NotifyCancelService = function (serviceId) {
          for (var i = 0; i < currentService.observersNotifyCancelService.length; i++) {
            currentService.observersNotifyCancelService[i](serviceId);
          }
        }
        currentService.providerCallback.NotifySuccessService = function (serviceInfo, driverInfo) {
          for (var i = 0; i < currentService.observersNotifySuccessService.length; i++) {
            currentService.observersNotifySuccessService[i](serviceInfo, driverInfo);
          }
        }
        currentService.providerCallback.OnServiceStatusChanged = function (serviceId, payment) {
          for (var i = 0; i < currentService.observersOnServiceStatusChanged.length; i++) {
            currentService.observersOnServiceStatusChanged[i](serviceId, payment);
          }
        }
        /* map */
        currentService.providerCallback.NotifyDriverLocation = function (driverLocationInfo) {
          for (var i = 0; i < currentService.observersNotifyDriverLocation.length; i++) {
            currentService.observersNotifyDriverLocation[i](driverLocationInfo);
          }
        }
        currentService.providerCallback.OnDriverStatusChanged = function (driverStatusInfo) {
          for (var i = 0; i < currentService.observersNotifyDriverStatus.length; i++) {
            currentService.observersNotifyDriverStatus[i](driverStatusInfo);
          }
        }
      }, function () { // on error connect
        var prevStatus = currentService.status;
        currentService.status = 0;
        if (onErrorCallback) onErrorCallback();
        if(currentService.status == prevStatus) return;
        for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
          currentService.observersServerStatusChanged[i](currentService.status);
        }
      }, function () { //on close connect
        var prevStatus = currentService.status;
        currentService.status = 0;
        if (onCloseCallback) onCloseCallback();
        if(currentService.status == prevStatus) return;
        for (var i = 0; i < currentService.observersServerStatusChanged.length; i++) {
          currentService.observersServerStatusChanged[i](currentService.status);
        }
      });
  }

  /* transport */
  this.loginTransport = function (userName, password, callback) {
    this.service.Send("WLoginTransport", userName, password, callback)
  }

  this.editTransport = function (agencyInfo, callback) {
    this.service.Send("EditTransport", agencyInfo, callback);
  }

  this.setTransportNotificationKey = function (key, callback) {
    this.service.Send("SetTransportNotificationKey", key, callback);
  }

  this.changeTransportPassword = function (transportId, newPassword, oldPassword, callback) {
    this.service.Send("ChangeTransportPassword", transportId, newPassword, oldPassword, callback);
  }

  this.increaseTransportCharge = function (transportId, amountCharge, callback) {
    this.service.Send("IncreaseTransportCharge", transportId, amountCharge, callback);
  }

  /* register */
  this.registerTransport = function (title, address, addressLat, addressLon, type, userName, password, licenceNumber, phonesArray, callback) {
    this.service.Send("WRegisterTransport", title, address, addressLat, addressLon, type, userName, password, licenceNumber, phonesArray, callback);
  }
  this.checkIfExistTransportUserName = function (username, callback) {
    this.service.Send("CheckIfExistTransportUserName", username, callback);
  }
  this.sendRandomNumberToTransportForConfirm = function (username, password, number, callback) {
    this.service.Send("SendRandomNumberToTransportForConfirm", username, password, number, callback);
  }
  this.confirmTransportByRandomNumber = function (username, password, number, code, callback) {
    this.service.Send("ConfirmTransportByRandomNumber", username, password, number, code, callback);
  }
  //
  // this.registerPassenger = function (name, family, phoneNumber, sex, email, callback) {
  //   this.service.Send("RegisterPassenger", name, family, phoneNumber, sex, email, callback);
  // }
  //
  // /* service */
  // this.getTransportServicesOfDay = function (agencyId, selectedDatetime, callback) {
  //   this.service.Send("GetTransportServicesOfDay", agencyId, selectedDatetime, callback);
  // }

  this.setResponse = function (transportId, serviceId, driverId, serviceMaxDelayTime, driverCommission, transportPayment, callback) {
    this.service.Send("WSetResponse", transportId, serviceId, driverId, serviceMaxDelayTime, driverCommission, transportPayment, callback);
  }

  // this.editService = function (service, callback) {
  //   this.service.Send("EditService", service, callback);
  // }
  //
  // this.changeIsCompleteFromTransport = function (serviceId, value, callback) {
  //   this.service.Send("ChangeIsCompleteFromTransport", serviceId, value, callback);
  // }
  //
  // //driver
  // this.getDriverServicesCount = function (driverId, callback) {
  //   this.service.Send("GetDriverServicesCount", driverId, callback);
  // }
  //
  // this.getDriverServices = function (driverId, startDate, endDate, index, length, callback) {
  //   this.service.Send("GetDriverServices", driverId, startDate, endDate, index, length, callback);
  // }
  //
  //multiple-controller-use
  this.filterServices = function (driversIdArray, passengersIdArray, contactsIdArray, fromDate, toDate, index, length, callback) {
    this.service.Send("FilterServices", driversIdArray, passengersIdArray, contactsIdArray, fromDate, toDate, index, length, callback);
  }

  this.getServiceNotifyCallbackInfoes = function (fromDate, toDate, index, length, callback) {
    this.service.Send("GetServiceNotifyCallbackInfoes", fromDate, toDate, index, length, callback);
  }

  this.getWaitingForCheckServices = function (callback) {
    this.service.Send("GetWaitingForCheckServices", callback);
  }
  //

  // /* update */
  this.getLastVersionOfLocalService = function (callback) {
    this.service.Send("GetLastVersionOfLocalService", callback);
  }
  this.getLastVersionOfWebSitePanel = function (callback) {
    this.service.Send("GetLastVersionOfWebSitePanel", callback);
  }


  // /* driver */
  this.addDriver = function (DriverInfo, PlaqueInfo, callback) {
    this.service.Send("WAddDriver", DriverInfo, PlaqueInfo, callback);
  }

  this.editDriver = function (driverInfo, callback) {
    this.service.Send("EditDriver", driverInfo, callback)
  }

  this.removeDriver = function (driverId, callback) {
   this.service.Send("RemoveDriver", driverId, callback);
  }

  this.unremoveDriver = function (driverId, callback) {
   this.service.Send("UnRemoveDriver", driverId, callback);
  }

  this.isExistDriverUsername = function (driverUsername, callback) {//boolean: T or F
    this.service.Send("IsExistDriverUserName", driverUsername, callback)
  }

  this.isExistDriverCode = function (driverCode, callback) {//boolean: T or F
    this.service.Send("IsExistDriverCode", driverCode, callback)
  }

  this.getDriversOfTransport = function (transportId, callback) {
    this.service.Send("GetDriversByTransportId", transportId, callback);
  }
  //
  this.getListOfDrivers = function (searchText, index, length, fromDate, toDate, callback) {//get list of driver and serach text in drivers on database
    this.service.Send("GetListOfDrivers", 0, searchText, index, length, fromDate, toDate, callback);
  }

  //map
  this.changeDriverStatus = function (driverId, driverStatus, callback) {//driverStatus : Available=1, UnAvailable=2, InService=3, PickupPassenger=4, InQueue=5;
    this.service.Send("ChangeDriverStatus", driverId, driverStatus, callback)
  }

  this.getDriversLocation = function (statusTrackingDrivers, callback) { //statusTrackingDrivers : true OR false
    this.service.Send("SetIsNotifyDriverLocationChanged", statusTrackingDrivers, callback);
  }

  /* payment */
  //transport
  // this.getListOfTransportObjectPayments = function (isDebit, fromIndex, length, callback) {
  //   this.service.Send("GetListOfTransportObjectPayments", isDebit, fromIndex, length, callback);
  // }
  //
  // //drivers
  // this.addDriverPayment = function (driverId, payment, callback) {
  //   this.service.Send("AddDriverPayment", driverId, payment, callback);
  // }
  //
  // this.removeDriverPayment = function (paymentId, callback) {
  //   this.service.Send("RemoveDriverPayment", paymentId, callback);
  // }
  //
  // this.filterDriverPayments = function (drivers, fromDate, toDate, index, length, callback) {
  //   this.service.Send("FilterDriverPayments", drivers, fromDate, toDate, index, length, callback);
  // }
  //
  // this.getListOfDriverPayments = function (driverId, startDate, endDate, index, length, callback) {
  //   this.service.Send("GetListOfDriverPayments", driverId, startDate, endDate, index, length, callback);
  // }
  //
  // //contacts
  // this.addContactPayment = function (passengerId, contactPaymentClass, callback) { //callback: the class of contactPayment
  //   this.service.Send("AddContactPayment", passengerId, contactPaymentClass, callback);
  // }
  //
  // this.removeContactPayment = function (paymentId, callback) {
  //   this.service.Send("RemoveContactPayment", paymentId, callback);
  // }
  //
  // this.filterContactPayments = function (contacts, fromDate, toDate, index, length, callback) {
  //   this.service.Send("FilterContactPayments", contacts, fromDate, toDate, index, length, callback);
  // }
  //
  // this.getListOfContactPayments = function (passengerId, startDate, endDate, index, length, callback) { //callback: list of contactPayment
  //   this.service.Send("GetListOfContactPayments", passengerId, startDate, endDate, index, length, callback);
  // }
  //
  // this.getSumOfContactsBalance = function (callback) {
  //   this.service.Send("GetSumOfContactsBalance", callback);
  // }

  /* not use func */
  this.sendMessageToPassenger = function (passengerId, messageText, callback) {
    this.service.Send("SendMessageToPassenger", passengerId, messageText, callback);
  }

  this.transportCancelService = function (serviceId, reason, callback) {
    this.service.Send("TransportCancelService", serviceId, reason, callback);
  }

  this.notifyServiceToDriver = function (contactInfo, serviceInfo, callback) {
    this.service.Send("NotifyServiceToDriver", contactInfo, serviceInfo, callback);
  }

  // this.getPassengerServicesCount = function (transportId, passengerId, callback) {
  //   this.service.Send("GetPassengerServicesCount", transportId, passengerId, callback);
  // }
  //
  // this.setServicesSettlement = function (serviceId, booleanValue, callback) {
  //   this.service.Send("SetServicesSettlement", serviceId, booleanValue, callback);
  // }
  //
  // this.addServicePayment = function (serviceId, payment, callback) {
  //   this.service.Send("AddServicePayment", serviceId, payment, callback);
  // }
});
