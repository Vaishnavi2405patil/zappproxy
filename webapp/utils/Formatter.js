sap.ui.define(
	function() {
	"use strict";

	var Formatter = {

		status :  function (sStatus) {
				if (sStatus === "In Approval") {
					return "Success";
				} /*else if (sStatus === "Reject") {
					return "Error";
				} else if (sStatus === "INAP"){
					return "Warning";
				}
				else if (sStatus === "INQR"){
					return "Warning";
				}*/else {
					return "None";
				}
		},
		
	};

	return Formatter;

},  /* bExport= */ true);