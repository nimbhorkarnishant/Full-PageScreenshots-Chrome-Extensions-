var script_ext = document.createElement("script")
script_ext.src="display_content.js" ; 
var capture_content = {
	tabId: null,		//ID of current tab
	screenshotCanvas: null, //Canvas element (Object type)
	screenshotContext: null,//2D context of screenshotCanvas element (object type)
	scrollBy: 0,//Number of pixels by which to move the screen
	size: {				
		width: 0,	// Sizes of page
		height: 0
	},
	originalParams: {
		overflow: "",	// Keep original params of page
		scrollTop: 0
	},
	//Initialize plugin
	initialize: function () {
		this.screenshotCanvas = document.createElement("canvas"); // creatingt canvas Element
		this.screenshotContext = this.screenshotCanvas.getContext("2d"); // creating object or page
		this.bindEvents();
	
	},
	 // Bind plugin events
	bindEvents: function () {
		// handle onClick plugin icon event
	
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			//document.getElementById("signin_heading").innerHTML=tabs[0].id;
			this.tabId = tabs[0].id;
			
			chrome.tabs.sendMessage(tabs[0].id, {
				"msg": "getPageDetails"
			});
		}.bind(this));
		// chrome.browserAction.onClicked.addListener(function (tab) {
		// 	this.tabId = tab.id;
		// chrome.tabs.sendMessage(tab.id, {
		// 		"msg": "getPageDetails"
		// 	});
		// }.bind(this));

		// handle chrome requests
		chrome.runtime.onMessage.addListener(function (request, sender, callback) {
			if (request.msg === "setPageDetails") {
				this.size = request.size;
				this.scrollBy = request.scrollBy;
				this.originalParams = request.originalParams;

				// set width & height of canvas element
				this.screenshotCanvas.width = this.size.width;
				this.screenshotCanvas.height = this.size.height;

				this.scrollTo(0);
			} else if (request.msg === "capturePage") {
				this.capturePage(request.position, request.lastCapture);
			}
		}.bind(this));
	},

	//Send request to scroll page on given position
	 
	scrollTo: function (position) {
		chrome.tabs.sendMessage(this.tabId, {
			"msg": "scrollPage",
			"size": this.size,
			"scrollBy": this.scrollBy,
			"scrollTo": position
		});
	},

	//Takes screenshot of visible area and merges it
	capturePage: function (position, lastCapture) {
		var self = this;
		// Note: Position is number and lastcapture is boolean
		// chrome api which return url of taking screen shot of current visible tab
		setTimeout(function () {chrome.tabs.captureVisibleTab(null, {"format": "png"}, function (dataURI) { 
				var newWindow,  // windows object 
				image = new Image(); // Image object

				if (typeof dataURI !== "undefined") {
					image.onload = function() {
						self.screenshotContext.drawImage(image, 0, position);

						if (lastCapture) {
							self.resetPage();
							var img_new=new Image();
							img_new.src=self.screenshotCanvas.toDataURL("image/png");
							// making image of giving url
							var doc=new jsPDF();                     // calling jspdf api method for pdf conversion
							doc.addImage(img_new, "png",15,40,180,160);  // converging img to pdf
							var base64pdf = btoa(doc.output());
							//alert(base64pdf);
							var pdf_url="data:application/pdf;base64,"+base64pdf;
							alert(pdf_url);

							newWindow = window.open();
							// Html Page 
							var st='<!DOCTYPE html><html><head><title>Capture Data</title><meta name="viewport" content="width=device-width, initial-scale=1">'+
							'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">'+
							'<style>body{margin: 0;font-family: Arial, Helvetica, sans-serif;}.topnav{overflow: hidden;background-color: #333;}'+
							'.topnav a {float: left;display: block;color: #f2f2f2;text-align: center;padding: 14px 16px;text-decoration: none;font-size: 17px;}'+
							'.topnav a:hover {background-color: #ddd;color: black;}.topnav a.active {background-color:rgb(236, 14, 162);color: white;}'+
							'.topnav .icon{display: none;}@media screen and (max-width: 600px) {.topnav a:not(:first-child) {display: none;}.topnav a.icon {'+
							'float: right;display: block;}}@media screen and (max-width: 600px) {.topnav.responsive {position: relative;}.topnav.responsive .icon {'+
							'position: absolute;right: 0;top: 0;}.topnav.responsive a {float: none;display: block;text-align: left;}}</style></head>'+
							'<body><div class="topnav" id="myTopnav"><a  class="active">Home</a><a download="capure data as Image" href='+self.screenshotCanvas.toDataURL("image/png")+'>Download as Image</a>'+
							'<a id="down_as_pdf" download="capure data as PDF" href='+pdf_url+'>Download as PDF</a><a href="javascript:void(0);" class="icon" id="mobile_view_click">'+
							'<i class="fa fa-bars"></i></a></div><div style="margin-top: 20px;" id="image_container"><img id="show_image" style="width:96%" src='+ self.screenshotCanvas.toDataURL("image/png") +'>'+
							'</div></body></html>';
		
							newWindow.document.write(st); 
							// var script = document.createElement("script");  // create a script DOM node
							// script.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.4/jspdf.min.js" ;   
							// var script_ext = document.createElement("script");  // create a script DOM node
							//script_ext.src="display_content.js" ;  
							var script = document.createElement("script");  // create a script DOM node
							script.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.4/jspdf.min.js" ;
							var script_ext = document.createElement("script");  // create a script DOM node
							script_ext.src="display_content.js" ; 
							newWindow.document.body.appendChild(script); //adding script to child
							newWindow.document.body.appendChild(script_ext); //adding script to child
						} else {
							self.scrollTo(position + self.scrollBy);     // calling scrolling function
						}
					};

					image.src = dataURI;
				} else {
					chrome.tabs.sendMessage(self.tabId, {
						"msg": "showError",
						"originalParams": self.originalParams
					});
				}
			});
		}, 300);
	},

	//Send request to set original params of page
	resetPage: function () {
		chrome.tabs.sendMessage(this.tabId, {
			"msg": "resetPage",
			"originalParams": this.originalParams
		});
	}
};



