define([
		'flight/lib/component',
		'data'
], function (def, Data) {
	function component() {
		this.defaultAttrs({
			'username': "#username",
			'password': "#password",
			'login': '.loginbutton'
		})

		var mode = null,
			callback = null;

		function verifyCredentials(username, password, callback, ecallback) {
			var key = Data.getKey(username, password)
			var ret = null;
			window.remoteStorage.getItem(key, function (storedValue) {
				if(storedValue == null){
						callback.call(this, storedValue)
				}
				else{
					var value = GibberishAES.dec(storedValue, password);
					try {
						var json = JSON.parse(value);
						callback.call(this, json)
					} catch (e) {
						//if(window.console) console.log(e)
						ecallback.call(this)
					}
				}
			})
		}

		this.after("initialize", function () {

			var originalXDM = $('<iframe src="xdm.html" id="xdm"></iframe>');
			$("body").prepend(originalXDM.clone())

			var that = this;

			this.on(document, "credentials:setup", function (evt, object) {
				$("body").addClass("credentials")
				this.select("login").text(object.action)
				mode = object.action;
				callback = object.callback;
			})

			this.on(document, "credentials:hide", function () {
				$("body").removeClass("credentials")
			})

			this.on(document, "credentials:save", function (evt, credentials) {
				var username = credentials.username,
					password = credentials.password;
					if(!window.xdmSet){
						that.trigger("error", {text: "Unable to save"})
						return;
					}
				verifyCredentials(username, password, function (json) {
					var payload = Data.encode(username, password);
					window.xdmSet(payload.key, payload.value)
					$("#xdm").one("load", function () {
						window.remoteStorage.getItem(payload.key, function(storedValue){
							if(storedValue != null && storedValue.substr(0,64) == payload.value.substr(0,64)){
								that.trigger("notification", {
									text: "Your tasks have been saved"
								})
								Data.credentials(credentials)
								that.trigger("credentials:hide")
							}
							else{
								that.trigger("error", {text: "Error saving tasks"})
							}
						})
						$("#xdm").remove();
						$("body").prepend(originalXDM.clone())
					})
				}, function () {
					that.trigger("error", {
						text: "Incorrect login"
					})
				})
			})

			this.on(document, "credentials:open", function (evt, credentials) {
				var username = credentials.username,
					password = credentials.password;
				verifyCredentials(username, password, function (json) {
					if(json != null){
						that.trigger("tasks:clear")
						Data.recover(json)
						that.trigger("tasks:import")
						that.trigger("notification", {
							text: "Your tasks have been loaded"
						})
						Data.credentials(credentials)
						that.trigger("credentials:hide")
					}
					else{
						that.trigger("error", {text:"Error loading tasks"})
					}
					
				}, function () {
					that.trigger("error", {
						text: "Incorrect login"
					})
				})
			})

			this.on("click", {
				"login": function () {
					var username = this.select("username").val()
					var password = this.select("password").val()
					if (mode && callback && username.length > 0 && password.length > 0) {
						this.trigger("credentials:" + mode, {
							username: username,
							password: password
						})
					} else {
						this.trigger("error", {
							text: "Please provide a valid username and/or password"
						})
					}
				}
			})
		})
	}
	return def(component)
})