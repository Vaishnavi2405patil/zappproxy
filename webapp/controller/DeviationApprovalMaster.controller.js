sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "zappproxy/utils/Formatter",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    Formatter,
    Filter,
    MessageToast,
    MessageBox,
    JSONModel,
    History,
    Dialog,
    Button,
    Fragment
  ) {
    "use strict";

    return Controller.extend("zappproxy.controller.DeviationApprovalMaster", {
      onInit: function () {
        var oModel = new sap.ui.model.odata.ODataModel(
          "/sap/opu/odata/sap/ZVECV_PURCHASE_ORDER_APPROVAL_SRV/",
          true
        );
        this.getView().setModel(oModel);

        if (!this._oDialogDeviationApproval) {
          this._oDialogDeviationApproval = sap.ui.xmlfragment(
            "zappproxy.fragments.DeviationApproval",
            this
          );
          this._oDialogDeviationApproval.setModel(this.getView().getModel());
        }

        // toggle compact style
        jQuery.sap.syncStyleClass(
          "sapUiSizeCompact",
          this.getView(),
          this._oDialog
        );
        this._oDialogDeviationApproval.open();

        var cmbUser = sap.ui.getCore().byId("cmbUser");
        var filters = [];

        var oUserName = new sap.ui.model.Filter(
          "Bname",
          "sap.ui.model.FilterOperator.Contains",
          this._UserID
        );
        filters.push(oUserName);

        oModel.read("/UserSearchSet", {
          filters: filters,
          success: function (odata, oResponse) {
            var oModelDataUser = new sap.ui.model.json.JSONModel();
            oModelDataUser.setData(odata);
            cmbUser.setModel(oModelDataUser);
          },
          error: function () {
            MessageBox.error("error");
          },
        });

        cmbUser.setFilterFunction(function (sTerm, oItem) {
          // A case-insensitive 'string contains' filter
          var sItemText = oItem.getText().toLowerCase(),
            sSearchTerm = sTerm.toLowerCase();

          return sItemText.indexOf(sSearchTerm) > -1;
        });
        var that = this;

        this._UserID = sap.ushell.Container.getService("UserInfo").getId();
        //this._UserID = "MSINGH13";

        this._Flag = "false";
      },
      OnGo: function (oEvent) {
        var that = this;

        var oModel = new sap.ui.model.odata.ODataModel(
          "/sap/opu/odata/sap/ZVECV_PURCHASE_ORDER_APPROVAL_SRV/",
          true
        );
        this.getView().setModel(oModel);

        var PONo = sap.ui.getCore().byId("idDevAppPO");
        var idUserId = sap.ui.getCore().byId("cmbUser");
        var ProxyUserID = sap.ui.getCore().byId("cmbUser").getValue();
        var searchtext1 = "(";
        var searchtext2 = ")";
        var pos1 = ProxyUserID.indexOf(searchtext1);
        var pos2 = ProxyUserID.indexOf(searchtext2);
        var POQueyToGetValue = ProxyUserID.substring(pos1 + 1, pos2);
        var PUserId;
        if (pos1 < 0 || pos2 < 0) {
          PUserId = ProxyUserID.toUpperCase();
        } else {
          PUserId = POQueyToGetValue;
        }

        /*		var POQueryUserName;
					if (pos1 > 0) {
						POQueryUserName = POQueyToGetValue;
					} else {
						POQueryUserName = ProxyUserID;
					}*/
        //
        var ProxyUserId = sap.ui.getCore().byId("txtPUserID");
        var oModelData = new sap.ui.model.json.JSONModel();
        var oListProry = this.getView().byId("listPO");
        var filters = [];
        var that = this;

        var values = {
          results: [],
        };

        var that = this;
        if (PONo.getValue() === "" || idUserId.getValue() === "") {
          MessageToast.show(" Please fill all required field ");
          return false;
        } else {
          oModel.read("/ValidateUserSet('" + PUserId + "')", {
            success: function (odata, oResponse) {
              if (odata.Valid === true) {
                oModel.read(
                  "/POProxyMatchSet(PO_NO='" +
                    PONo.getValue() +
                    "',UserID='" +
                    PUserId +
                    "')",
                  {
                    success: function (odata, oResponse) {
                      if (odata.Valid === true) {
                        oModel.read(
                          "/POProxyDetailsSet(PO_NO='" +
                            PONo.getValue() +
                            "',UserID='" +
                            PUserId +
                            "')",
                          {
                            success: function (odata, oResponse) {
                              if (odata.PoType === "CHANGE") {
                                odata.PO_Amount = "";
                                odata.Document_Type = "";
                              }
                              values.results.push(odata);
                              oModelData.setData(values);
                              oListProry.setModel(oModelData);
                              that.OnCancelDeviationApv();
                            },
                            error: function (oError) {
                              //	MessageBox.error("Error : " + oError);
                            },
                          }
                        );
                      } else {
                        MessageBox.error(
                          "This PO no is not valid for this USERID"
                        );
                      }
                    },
                  }
                );
              } else if (odata.Valid === false) {
                MessageBox.alert("UserID is invalid");
              }
            },
          });
        }
      },
      OnCancelDeviationApv: function (oEvent) {
        //	var oList = this.getView().byId("listPO");
        //	oList.setModel(null);
        this._oDialogDeviationApproval.close();
        if (this._oDialogDeviationApproval) {
          this._oDialogDeviationApproval.destroy();
          this._oDialogDeviationApproval = null;
        }
      },
      OnPODeviationApproval: function () {
        var oModel = this.getView().getModel();
        var oList = this.getView().byId("listPO");
        var PONo = sap.ui.getCore().byId("idDevAppPO").getValue();
        var filters = [];
        var that = this;

        var values = {
          results: [],
        };

        oModel.read("/POProxyDetailsSet('" + PONo + "')", {
          success: function (odata, oResponse) {
            var oModelData = new sap.ui.model.json.JSONModel();

            values.results.push(odata);
            oModelData.setData(values);
            oList.setModel(oModelData);
            that.OnCancelDeviationApv();
          },
          error: function () {
            //	MessageBox.error("error");
          },
        });
        /*this._oDialogDeviationApproval.close();
				if (this._oDialogDeviationApproval) {
					this._oDialogDeviationApproval.destroy();
					this._oDialogDeviationApproval = null; // make it falsy so that it can be created next time
				}*/
      },

      attachUpdateFinished: function (oEvent) {
        var oList = this.getView().byId("listPO");
        var aItems = oEvent.getSource().getItems();
        var TempPONo = this.getView().byId("txtTemPO");

        var TempPONoSelectionChange = this.getView().byId(
          "txtTemPOSelctionChange"
        );

        if (this._Flag === "false") {
          if (aItems.length > 0) {
            oEvent.getSource().getItems()[0].setSelected(true);
            oEvent.getSource().getItems()[0].firePress();
            //	var poTemp = oEvent.getSource().getSelectedItem().getTitle();
            //	TempPONo.setText(poTemp);
            this._Flag = "true";
          }
        } else if (this._Flag === "true") {
          if (aItems.length > 0) {
            for (var i = 0; i < aItems.length; i++) {
              if (
                oEvent.getSource().getItems()[i].getTitle() ===
                TempPONoSelectionChange.getText()
              ) {
                aItems[i].setSelected(true);
                aItems[i].firePress();
                //	this._Flag = "false";
                break;
              } else {
                oEvent.getSource().getItems()[0].setSelected(true);
                oEvent.getSource().getItems()[0].firePress();
              }
            }
          }
        }
      },

      onSelectionChange: function (e) {
        var oList = this.getView().byId("listPO");
        var aItems = oList.getItems();
        var PoNo = e.getParameters().listItem.getTitle();
        var POType = e.getParameters().listItem.getAttributes()[3].getText();
        var Sid = this.getView().sId;
        var ProxyUserId = this.getView().byId("txtPUserID").getText();

        var TempPONoSelectionChange = this.getView().byId(
          "txtTemPOSelctionChange"
        );
        TempPONoSelectionChange.setText(PoNo);

        this.getRouter().navTo("DeviationApprovalDetail", {
          PO_No: PoNo,
          Sid: Sid,
          ProxyUser: ProxyUserId,
          Type: POType,
        });

        if (this._prevSelect) {
          this._prevSelect.$().css("background-color", "");
        }
        var item = e.getParameter("listItem");
        item.$().css("background-color", "#D3D3D3");

        this._prevSelect = item;
      },
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      _onEditMatched: function (oEvent) {
        var oList = this.getView().byId("listPO");

        oList.removeSelections(true);

        /*for (var i = 0; i < oListToBeApprove.getItems.length; i++) {
				if (oListToBeApprove.getItems()[i].getSelected() === true) {
						
				}
				}*/
      },

      onListItemPress: function (oEvent) {
        var objEdit = oEvent.getSource().getBindingContext().getObject();
        var Sid = this.getView().sId;
        var ProxyUserId = this.getView()
          .byId("txtPUserID")
          .setText(objEdit.UserID);

        this.getRouter().navTo("DeviationApprovalDetail", {
          PO_No: objEdit.PO_NO,
          Sid: Sid,
          ProxyUser: objEdit.UserID,
          Type: objEdit.PoType,
        });
      },
      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("query");
        var oFilter = new sap.ui.model.Filter({
          // two filters
          filters: [
            new sap.ui.model.Filter(
              "PO_No",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ), // filter for value 1
          ],
        });
        var oBinding = this.byId("listPO").getBinding("items");
        oBinding.filter(oFilter, sap.ui.model.FilterType.Application);
      },
      handleOpenDialog: function (oEvent) {
        if (!this._oDialogDeviationApproval) {
          this._oDialogDeviationApproval = sap.ui.xmlfragment(
            "zappproxy.fragments.DeviationApproval",
            this
          );
          this._oDialogDeviationApproval.setModel(this.getView().getModel());
        }

        // toggle compact style
        jQuery.sap.syncStyleClass(
          "sapUiSizeCompact",
          this.getView(),
          this._oDialog
        );
        this._oDialogDeviationApproval.open();
      },
      handleConfirm: function (oEvent) {
        var query = oEvent.getSource().getSelectedFilterItems();
        var oBinding = this.byId("listPO").getBinding("items");
        if (query.length > 0) {
          var oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter(
                "PO_Status",
                sap.ui.model.FilterOperator.EQ,
                query[0].getText()
              ), // filter for value 1
            ],
          });
          oBinding.filter(oFilter);
        } else {
          oBinding.filter([]);
        }
      },

      OnSelectUser: function (oEvent) {
        var oModel = this.getView().getModel();
        var oModelDataUser = new sap.ui.model.json.JSONModel();
        var SearchText = oEvent.getSource().getValue();
        var cmbUser = sap.ui.getCore().byId("cmbUser");
        var filters = [];
        if (SearchText.length >= 3) {
          var oBname = new sap.ui.model.Filter("Bname", "EQ", SearchText);
          filters.push(oBname);

          oModel.read("/UserSearchSet", {
            filters: filters,
            success: function (odata, oResponse) {
              oModelDataUser.setData(odata);
              cmbUser.setModel(oModelDataUser);
              //	cmbUser.bindAggregation("suggestionItems", "/results");
              cmbUser.bindAggregation("suggestionItems", {
                path: "/results",
                template: new sap.ui.core.Item({
                  text: "{NameFirst} {NameLast}({Bname})",
                  //	key : "{Bname}"
                }),
              });
            },
            error: function () {
              MessageBox.error("error");
            },
          });
        }
      },
    });
  }
);
