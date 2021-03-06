///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    "dojo/Deferred",
    'jimu/BaseWidget',
    'dijit/Dialog',
    'esri/symbols/jsonUtils',
     'jimu/WidgetManager',
     'jimu/PanelManager',
    'dijit/layout/AccordionContainer', 
    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',
    'dijit/form/TextBox',
    'dojox/grid/DataGrid',
    'dojo/data/ItemFileWriteStore',
    'dijit/form/DropDownButton',
    'dijit/TooltipDialog',
    'dijit/form/TextBox',
    'dijit/TitlePane'
    
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    Deferred,
    BaseWidget,
    Dialog,
    esriSymJsonUtils,
    WidgetManager,
    PanelManager) {
    	var singleLayerToBeAddedRemoved = "";
    	var bNoTopicSelected = false;
    	var communitySelected = "";
        var   layerData = {
            identifier: "eaID",  //This field needs to have unique values
            label: "name", //Name field for display. Not pertinent to a grid but may be used elsewhere.
            items: []};
    	var layerDataStore = new dojo.data.ItemFileWriteStore({ data:layerData });
    	var SelectableLayerFactory = function(data) {
		    this.eaLyrNum = data.eaLyrNum;
		    this.name = data.name;
		    this.eaDescription = data.eaDescription;		    
		    this.eaDfsLink = data.eaDfsLink;
		    this.eaCategory = data.eaCategory;
		    this.eaID = data.eaID;
		    this.eaMetadata = data.eaMetadata;
		    this.eaScale = data.eaScale;
		    this.eaTags = data.eaTags;
		    this.eaTopic = data.eaTopic
		}
		var selectableLayerArray = [];
		
		var hashFactsheetLink = {};
		var hashLayerNameLink = {};
		
		var hashLayerName = {};
		var hashEaDescription = {};
		var hashEaTag = {};
		

		var objectPropInArray = function(list, prop, val) {
		  if (list.length > 0 ) {
		    for (i in list) {
		      if (list[i][prop] === val) {
		        return true;
		      }
		    }
		  }
		  return false;  
		};


		var chkIdDictionary = {};
		var nationalTopicList = [];
		var communityTopicList = [];
		var loadJSON = function(callback){   
	
	        var xobj = new XMLHttpRequest();
	
	        xobj.overrideMimeType("application/json");

        xobj.open('GET', 'widgets/LocalLayer/config.json', true); 

        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && xobj.status == "200") {
	                callback(xobj.responseText);
	              }
	        };
	        xobj.send(null);  
	    };    	
		  var loadCommunityJSON = function(callback){   
	
	        var xobj = new XMLHttpRequest();
	
	        xobj.overrideMimeType("application/json");

        xobj.open('GET', 'widgets/LocalLayer/communitymetadata.json', true); 

        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && xobj.status == "200") {
	                callback(xobj.responseText);
	              }
	        };
	        xobj.send(null);  
	    }; 	    
	    var _onSelectAllLayers = function() {
			for (var key in chkIdDictionary) {
			  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
	        	document.getElementById(key).checked = true;
	
			  }
			}
	   };
	    var _onUnselectAllLayers = function() {
			for (var key in chkIdDictionary) {
			  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
	        	 document.getElementById(key).checked = false;	
			  }
			}
	   };	   
	   var topicsBeingSelected = function() {
			var atLeastOneTopicChosen = false;
			var chkboxId;
			var checkbox;
		    for (var key in window.topicDic) {
				chkboxId = window.chkTopicPrefix + window.topicDic[key];
				checkbox = document.getElementById(chkboxId);		    	
				if((checkbox.checked == true ) &&(checkbox.className == "cmn-toggle cmn-toggle-round-flat")){
					atLeastOneTopicChosen = true;
				}
			}	
			return atLeastOneTopicChosen;	   	
	   }
	   var addNewSearchBoxDataTable = function(stringPlaceHolder) {
	   	    var table = $('#tableLyrNameDescrTag').DataTable();
	   	    table.destroy();
		    
			var nSearchableColumns = document.getElementById('tableLyrNameDescrTag').getElementsByTagName('tr')[0].getElementsByTagName('th').length;
			var tableOfRelationship = document.getElementById("tableLyrNameDescrTag");
		    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0]; 

	        for (var key in hashLayerName) {
		    
				var eaID = key;				
				var layerName = hashLayerName[key];		
				var eaDescription = hashEaDescription[key];
				var eaTags = hashEaTag[key];
	
	    	    var newRow   = tableRef.insertRow(tableRef.rows.length);
	    	    	    	    
	           	var newCell  = newRow.insertCell(0);
				newCell.appendChild(document.createTextNode(eaID));
				newRow.appendChild(newCell);
	
	           	newCell  = newRow.insertCell(1);
				newCell.appendChild(document.createTextNode(layerName));
				newRow.appendChild(newCell);			
	   
	           	newCell  = newRow.insertCell(2);
				newCell.appendChild(document.createTextNode(eaDescription));
				newRow.appendChild(newCell);
				
	           	newCell  = newRow.insertCell(3);
				newCell.appendChild(document.createTextNode(eaTags));
				newRow.appendChild(newCell);
		    }
	   	   $('#tableLyrNameDescrTag').DataTable( {
			   language: {
			        searchPlaceholder: stringPlaceHolder			
			   },
		        "columnDefs": [
		            {
		                "targets": [ 0 ],
		                "searchable": false
		            }
		        ]
		    } );	

			$('#tableLyrNameDescrTag').on( 'draw.dt', function () {
			    _updateSelectableLayer();		    
			} );
					
			var page = document.getElementById('tableLyrNameDescrTag_paginate');
			page.style.display = 'none';	
				
			var searchBox = document.getElementById('searchFilterText');
			searchBox.style.width= "100%";		
	   }
	   var updateSearchBoxDataTable = function() {

			if (topicsBeingSelected() == true) {
				if (bNoTopicSelected) {
					addNewSearchBoxDataTable("Search selected topics");  					
				}
				bNoTopicSelected = false;
			} else {
				if (!bNoTopicSelected) {
	   				addNewSearchBoxDataTable("Search all layers");	
				}				
				bNoTopicSelected = true;
			}
	   }
	   
	    var	_addSelectableLayerSorted = function(items){	    	

			updateTopicToggleButton();
    		var nSearchableColumns = document.getElementById('tableLyrNameDescrTag').getElementsByTagName('tr')[0].getElementsByTagName('th').length;
    		var eaIDFilteredList = [];
			tdIndex = 0;
			
			$("#tableLyrNameDescrTag").dataTable().$('td',{"filter":"applied"}).each( function (value, index) {
				var currentCellText = $(this).text();
				
				if (tdIndex == 0) {
					eaIDFilteredList.push(currentCellText);
				}
				tdIndex = tdIndex + 1;
				if (tdIndex == nSearchableColumns) {
					tdIndex = 0;
				}				
			} ); 
			var tableOfRelationship = document.getElementById("tableSelectableLayers");
		    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0]; 
            while (tableRef.firstChild) {
                tableRef.removeChild(tableRef.firstChild);
            }
            var numOfSelectableLayers = 0;
            var totalNumOfLayers = 0;
			var bAtLeastOneTopicSelected = topicsBeingSelected();            
	    	dojo.forEach(items, function(item) {
	           	
	           	var currentLayerSelectable = false;
				eaLyrNum = layerDataStore.getValue( item, 'eaLyrNum').toString();
				eaID = layerDataStore.getValue( item, 'eaID').toString();
				
				layerName = layerDataStore.getValue( item, 'name');

    			eaDescription = layerDataStore.getValue( item, 'eaDescription');
    			eaDfsLink = layerDataStore.getValue( item, 'eaDfsLink');
    			eaScale = layerDataStore.getValue( item, 'eaScale');
    			eaMetadata = layerDataStore.getValue( item, 'eaMetadata');
    			bSelectByScale = false;
				switch (eaScale) {
					case "NATIONAL":
						totalNumOfLayers = totalNumOfLayers + 1;
						var chkScale = document.getElementById("chkNational");
						if(chkScale.checked == true){
							bSelectByScale = true;
						}
						break;
					case "COMMUNITY":
						
						var chkScale = document.getElementById("chkCommunity");
						totalNumOfLayers = totalNumOfLayers + 1;
						if(chkScale.checked == true){

							if ((communitySelected == "") || (communitySelected == window.strAllCommunity)){
							bSelectByScale = true;
						}
							else{
								if (eaMetadata != "") {
									if (window.communityMetadataDic.hasOwnProperty(eaMetadata)) {
										communityInfo = window.communityMetadataDic[eaMetadata];
										if (communityInfo.hasOwnProperty(communitySelected)) {
											bSelectByScale = true;
										}
									}
								}
							}
						}
						break;
    			
				}    			
				eaTopic = layerDataStore.getValue( item, 'eaTopic');
				eaCategory = layerDataStore.getValue( item, 'eaCategory');

				eachLayerCategoryList = eaCategory.split(";");
				if (bSelectByScale) {
					
					var chkCategery = document.getElementById(window.chkTopicPrefix+window.topicDic[eaTopic]);
					if (typeof(chkCategery) != 'undefined' && chkCategery != null) {
						if(chkCategery.checked == true){
							currentLayerSelectable = true;				
						}
					}			
					
				}// end of if (bSelectByScale)

				if ((currentLayerSelectable || (bAtLeastOneTopicSelected == false)) &&(eaIDFilteredList.indexOf(eaID) >= 0)) {//add the current item as selectable layers
					if ((window.allLayerNumber.indexOf(eaID)) == -1) {                        	
                    	window.allLayerNumber.push(eaID);
                    }
					numOfSelectableLayers = numOfSelectableLayers + 1;

			       	var newRow   = tableRef.insertRow(tableRef.rows.length);
			       	newRow.style.height = "38px";
			       	var newCheckboxCell  = newRow.insertCell(0);
					var checkbox = document.createElement('input');
					checkbox.type = "checkbox";
			
			        chkboxId = "ck" + eaID;
					checkbox.name = chkboxId;
					checkbox.value = 1;
					checkbox.id = chkboxId;
					newCheckboxCell.style.verticalAlign = "top";//this will put checkbox on first line
			        newCheckboxCell.appendChild(checkbox);    			              
			
			       	chkIdDictionary[chkboxId] = layerName;
			        var newCell  = newRow.insertCell(1);
			        newCell.style.verticalAlign = "top";//this will put layer name on first line
			        
					var newTitle  = document.createElement('div');
			        newTitle.innerHTML = layerName;
			        newTitle.title = eaDescription;
			        
					// add the category icons				
					if (!(document.getElementById("hideIcons").checked)) {
				        var photo = document.createElement("td");
						var ulElem = document.createElement("ul");
			
						ulElem.setAttribute("id", "navlistSearchfilter");					
					var liHomeElem = null;
					var aHomeElem = null;
					indexImage = 0;
					for (var key in window.categoryDic) {
			
						    liElem = document.createElement("li");
							liElem.style.left = (indexImage*20).toString() + "px";
							liElem.style.top = "-10px";
							aElem = document.createElement("a");
							aElem.title  = key;
							liElem.appendChild(aElem);
							ulElem.appendChild(liElem);							
							if (eaCategory.indexOf(key) !=-1) {
								liElem.setAttribute("id",window.categoryDic[key]);
							}
							else {
								liElem.setAttribute("id",window.categoryDic[key] + "_bw");
							}
						indexImage = indexImage + 1;
					}
			        photo.appendChild(ulElem);
					newTitle.appendChild(photo);
		        	}

					// end of adding the category icons	
					newCell.appendChild(newTitle);
					
					var newButtonInfoCell  = newRow.insertCell(2);
					var buttonInfo = document.createElement('input');
					buttonInfo.type = "button";
			        var buttonInfoId = "but" + eaID;
					buttonInfo.name = buttonInfoId;
					buttonInfo.id = buttonInfoId;
					buttonInfo.value = "i";
					buttonInfo.style.height = "16px";
					buttonInfo.style.width = "16px";
					buttonInfo.style.lineHeight = "3px";//to set the text vertically center
					
					newButtonInfoCell.style.verticalAlign = "top";//this will put checkbox on first line
			        newButtonInfoCell.appendChild(buttonInfo);  
			        hashFactsheetLink[buttonInfoId] = eaDfsLink;
			        hashLayerNameLink[buttonInfoId] = layerName;
			        document.getElementById(buttonInfoId).onclick = function(e) {
				        //window.open(window.dataFactSheet + selectableLayerArray[i]['eaDfsLink']);//this will open the wrong link
				        if (hashFactsheetLink[this.id] == "N/A") {
			        		var dataFactNote = new Dialog({
						        title: hashLayerNameLink[this.id],
						        style: "width: 300px",    
					    	});
					        dataFactNote.show();
					        dataFactNote.set("content", "Data fact sheet link is not available!");
			
				        } else {
				        	window.open(window.dataFactSheet + hashFactsheetLink[this.id]);
				        }		      
				    };    	
				}//end of if (currentLayerSelectable)
        });	
 		dojo.byId("numOfLayers").value = " " + String(numOfSelectableLayers) + " of " + String(totalNumOfLayers) + " Maps";
    	dojo.byId("selectAllLayers").checked = false;
		for (var key in chkIdDictionary) {
			
		  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
		  	document.getElementById(key).addEventListener('click', function() {
		  		
				if (this.checked){
					singleLayerToBeAddedRemoved = "a" + "," + this.getAttribute("id").replace("ck", "");
					document.getElementById('butAddSingleLayer').click();
				}
				else{
					singleLayerToBeAddedRemoved = "r" + "," + this.getAttribute("id").replace("ck", "");
					document.getElementById('butAddSingleLayer').click();
				}				
		    });
		  }
		}    	
	};	   

	var updateTopicToggleButton = function() {
	    for (var key in window.topicDic) {
	    	var bCurrentTopicDisabled = true;
			var chkScale = document.getElementById("chkNational");

			if((document.getElementById("chkNational").checked == true) && (nationalTopicList.indexOf(key) >= 0)){
				bCurrentTopicDisabled = false;
			}
			if((document.getElementById("chkCommunity").checked == true) && (communityTopicList.indexOf(key) >= 0)){
				bCurrentTopicDisabled = false;
			}
			
	        var chkboxId = window.chkTopicPrefix + window.topicDic[key];
	        var checkbox = document.getElementById(chkboxId);			
	       if (bCurrentTopicDisabled) {
		        checkbox.className ="cmn-toggle cmn-toggle-round-flat-grayedout";	
		        checkbox.removeEventListener("click", _updateSelectableLayer);	       	
	       } else {
	       		if (checkbox.className == "cmn-toggle cmn-toggle-round-flat-grayedout"){
	       			checkbox.checked = false;//If the togglebutton is grayed out previously, then it should be off when it is activated
	       		}
		        checkbox.className ="cmn-toggle cmn-toggle-round-flat";	
		        checkbox.addEventListener("click", _updateSelectableLayer);	     	       	
	       }
		}
	}
	
	
	var	_updateSelectableLayer = function(){	
		
		layerDataStore.fetch({
				sort: {attribute: 'name', descending: false},
				onComplete: _addSelectableLayerSorted
				});
	};
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
        baseClass: 'jimu-widget-simplesearchfilter',
		onReceiveData: function(name, widgetId, data, historyData) {
			if (name == 'SelectCommunity'){
			   var stringArray = data.message.split(",");
			   if (stringArray[0] != "u") {
				 communitySelected = data.message;
				 _updateSelectableLayer();
			   } 	
			}		  
		},

    displayCategorySelection: function() {
		
        var tableOfRelationship = document.getElementById('categoryTable');
	    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];    	
	    indexImage = 0;
	    var categoCount = 1;
	    var newRow;
	    for (var key in window.topicDic) {
	    	categoCount =  categoCount + 1;
			if (categoCount % 2 == 0) {
	    	    newRow   = tableRef.insertRow(tableRef.rows.length);    	    
    	    
	           	newRow.style.height = "20px";
	           	var newCheckboxCell  = newRow.insertCell(0);
	           	var checkbox = document.createElement('input');
				checkbox.type = "checkbox";
				
		        chkboxId = window.chkTopicPrefix + window.topicDic[key];
	
				checkbox.name = chkboxId;
				checkbox.value = 0;
				checkbox.id = chkboxId;
				checkbox.className ="cmn-toggle cmn-toggle-round-flat";
		        newCheckboxCell.appendChild(checkbox);    
		        var label = document.createElement('label');
		        label.setAttribute("for",chkboxId);
				label.innerHTML = "";
				newCheckboxCell.appendChild(label);
	
				//checkbox.addEventListener('click', _updateSelectableLayer);
				checkbox.addEventListener('click', function() {
					updateSearchBoxDataTable();
					_updateSelectableLayer();
					
				});
						
		    
				/// add category title:
	           	var newTitleCell  = newRow.insertCell(1);
	           	newTitleCell.style.width = "40%";
	        
				var title = document.createElement('label');
				title.innerHTML = key;    
				newTitleCell.appendChild(title);     				
			}
			else {
	           	var newCheckboxCell  = newRow.insertCell(2);
	           	var checkbox = document.createElement('input');
				checkbox.type = "checkbox";
	            chkboxId = window.chkTopicPrefix + window.topicDic[key];
				checkbox.name = chkboxId;
				checkbox.value = 0;
				checkbox.id = chkboxId;
				checkbox.className ="cmn-toggle cmn-toggle-round-flat";
		        newCheckboxCell.appendChild(checkbox);    
		        var label = document.createElement('label');
		        label.setAttribute("for",chkboxId);
				label.innerHTML = "";
				newCheckboxCell.appendChild(label);
				
				//checkbox.addEventListener('click', _updateSelectableLayer);
				
				checkbox.addEventListener('click', function() {
					updateSearchBoxDataTable();
					_updateSelectableLayer();					
				});		
			
			/// add category title:
	           	var newTitleCell  = newRow.insertCell(3);
	           	newTitleCell.style.width = "40%";
				var title = document.createElement('label');
				title.innerHTML = key;    
				newTitleCell.appendChild(title);        
			}

		}
        /* Commenting out Supply/demand/driver choices.
		document.getElementById("Supply").onclick = function() {
		    _updateSelectableLayer();
		};
		document.getElementById("Demand").onclick = function() {
		    _updateSelectableLayer();
		};	
		document.getElementById("Driver").onclick = function() {
		    _updateSelectableLayer();
		};
		document.getElementById("SpatiallyExplicit").onclick = function() {
		    _updateSelectableLayer();
		};	
        */
		document.getElementById("hideIcons").onclick = function() {
		    _updateSelectableLayer();
		};					
		document.getElementById("selectAllLayers").onclick = function() {
			if (this.checked){
		    	_onSelectAllLayers();
			    document.getElementById('butAddAllLayers').click();
		   } else {
		   		_onUnselectAllLayers();
		   		document.getElementById('butRemAllLayers').click();
		   }
		};
		layersToBeAdded = "a";
	    

    },
	displayGeographySelection: function() {
        var tableOfRelationship = document.getElementById('geographyTable');
	    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];    	
	    indexImage = 0;
	    
		//add row of National geography
	    var newRow   = tableRef.insertRow(tableRef.rows.length);	    
       	newRow.style.height = "20px";
       	var newCheckboxCell  = newRow.insertCell(0);
       	var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
        chkboxId = "chkNational";
		checkbox.name = chkboxId;
		checkbox.checked = true;
		checkbox.id = chkboxId;
		checkbox.className ="cmn-toggle cmn-toggle-round-flat";
        newCheckboxCell.appendChild(checkbox);    
        var label = document.createElement('label');
        label.setAttribute("for",chkboxId);
		label.innerHTML = "";
		newCheckboxCell.appendChild(label);
		
		checkbox.addEventListener('click', function() {
			_updateSelectableLayer();
	    });				
		/// add National title:
       	var newTitleCell  = newRow.insertCell(1);
		var title = document.createElement('label');
		title.innerHTML = "National";    
		newTitleCell.appendChild(title); 
        newTitleCell.style.paddingRight = "15px";

		//add Community geography to same row
       	var newCheckboxCell  = newRow.insertCell(2);
       	var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
        chkboxId = "chkCommunity";
		checkbox.name = chkboxId;
		checkbox.checked = true;
		checkbox.id = chkboxId;
		checkbox.className ="cmn-toggle cmn-toggle-round-flat";
        newCheckboxCell.appendChild(checkbox);    
        var label = document.createElement('label');
        label.setAttribute("for",chkboxId);
		label.innerHTML = "";
		newCheckboxCell.appendChild(label);
		
		checkbox.addEventListener('click', function() {
			_updateSelectableLayer();
        	if (!this.checked){
				var btn = document.getElementById("butSelectOneCommunity"); 
				btn.disabled = true;	
        	} else {
				var btn = document.getElementById("butSelectOneCommunity"); 
				btn.disabled = false;        		
        	}		
	    });				
		/// add Community title:
       	var newTitleCell  = newRow.insertCell(3);
		var title = document.createElement('label');
		title.innerHTML = "Community";    
		newTitleCell.appendChild(title); 
		
		var newButtonInfoCell  = newRow.insertCell(4);
		var buttonInfo = document.createElement('input');
		buttonInfo.type = "button";
        var buttonInfoId = "butSelectOneCommunity";
		buttonInfo.name = buttonInfoId;
		buttonInfo.id = buttonInfoId;
		buttonInfo.value = "+/-";
		buttonInfo.style.height = "16px";
		buttonInfo.style.width = "28px";
		buttonInfo.style.lineHeight = "3px";//to set the text vertically center
		
		newButtonInfoCell.style.verticalAlign = "center";//this will put checkbox on first line
        newButtonInfoCell.appendChild(buttonInfo);  
        document.getElementById(buttonInfoId).onclick = function(e) {
   			document.getElementById('butOpenSelectCommunityWidget').click();
	    };   		  		

	},
      startup: function() {

        this.inherited(arguments);
	    this.fetchDataByName('SelectCommunity');		 
	    this.displayCategorySelection();
		this.displayGeographySelection();
		dojo.connect(dijit.byId("selectionCriteria"), "toggle", function (){
		    if (dijit.byId('selectionCriteria')._isShown()) {
		    	if (navigator.userAgent.indexOf("Chrome")>=0) {
		    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 515px)"; 
		    	} else if(navigator.userAgent.indexOf("Firefox")>=0) {
		    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 630px)"; 
		    	} else {
		    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 530px)"; 
		    	}
		    	
		    } else {
		    	if (navigator.userAgent.indexOf("Chrome")>=0) {
		    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 125px)";
		    	} else if(navigator.userAgent.indexOf("Firefox")>=0) {
		    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 125px)"; 
		    	} else {
		    		document.getElementById('tableSelectableLayersArea').style.height = "calc(100% - 125px)";
		    	}		    	

		    }
		}); 
		
        loadJSON(function(response) {
            var localLayerConfig = JSON.parse(response);
            var arrLayers = localLayerConfig.layers.layer;
            console.log("arrLayers.length:" + arrLayers.length);
			///search items
	        var tableOfRelationship = document.getElementById('tableLyrNameDescrTag');
		    var tableRef = tableOfRelationship.getElementsByTagName('tbody')[0];    
            for (index = 0, len = arrLayers.length; index < len; ++index) {
                layer = arrLayers[index];                          
                var indexCheckbox = 0;

                if(layer.hasOwnProperty('eaID')) {
                	eaID = layer.eaID.toString();
                	if (eaID.trim() != "") {

	                    if(layer.hasOwnProperty('eaLyrNum')){
	                        eaLyrNum = layer.eaLyrNum.toString();
	                    }
	                    else {
	                    	eaLyrNum = "";
	                    }
			                        
			            layerName = "";          
	                	if(layer.hasOwnProperty('name') ){	                		
		                	if ((layer.name != null)){
		                    	layerName = layer.name.toString();
	                    }
	                    }
	                	if(layer.hasOwnProperty('eaDescription')){
	                    	eaDescription = layer.eaDescription.toString();
	                    }
	                    else {
	                    	eaDescription = "";
	                    }
	                    if(layer.hasOwnProperty('eaDfsLink')){
	                    	eaDfsLink = layer.eaDfsLink.toString();
	                    }
	                    else {
	                    	eaDfsLink = "";
	                    }
	                    if(layer.hasOwnProperty('eaMetadata')){
	                    	eaMetadata = layer.eaMetadata.toString();
	                    }
	                    else {
	                    	eaMetadata = "";
	                    }
	                    if(layer.hasOwnProperty('eaTopic')){
	                    	eaTopic = layer.eaTopic.toString();
	                    }
	                    else {
	                    	eaTopic = "";
	                    }	                    
	                    if(layer.hasOwnProperty('eaScale')){
	                    	eaScale = layer.eaScale.toString();
	                    	if (eaScale == "NATIONAL") {
	                    		if (nationalTopicList.indexOf(eaTopic) < 0) {
	                    			nationalTopicList.push(eaTopic);
	                    		}	                    		
	                    	}
	                    	if (eaScale == "COMMUNITY") {
	                    		if (communityTopicList.indexOf(eaTopic) < 0) {
	                    			communityTopicList.push(eaTopic);
	                    		}	                    		
	                    	}	                    	
	                    }
	                    else {
	                    	eaScale = "";
	                    }		                        
					    var eaCategoryWhole =  "";
					    if(layer.hasOwnProperty('eaBCSDD')){
					    	for (categoryIndex = 0, lenCategory = layer.eaBCSDD.length; categoryIndex < lenCategory; ++categoryIndex) {
					    		eaCategoryWhole = eaCategoryWhole + layer.eaBCSDD[categoryIndex] + ";";
					    	}
					    }
					    eaCategoryWhole = eaCategoryWhole.substring(0, eaCategoryWhole.length - 1);
					    
					    var eaTagsWhole =  "";
					    if(layer.hasOwnProperty('eaTags')){
					    	for (tagsIndex = 0, lenTags = layer.eaTags.length; tagsIndex < lenTags; ++tagsIndex) {
					    		eaTagsWhole = eaTagsWhole + layer.eaTags[tagsIndex] + ";";
					    	}
					    }
					    eaTagsWhole = eaTagsWhole.substring(0, eaTagsWhole.length - 1);						    
				    	//var layerItem = {eaLyrNum: eaLyrNum, name: layerName, eaDescription: eaDescription, eaDfsLink: eaDfsLink, eaCategory: eaCategoryWhole, eaID: layer.eaID.toString(), eaMetadata: eaMetadata, eaScale: eaScale, eaTags:eaTagsWhole};
				    	var layerItem = {eaLyrNum: eaLyrNum, name: layerName, eaDescription: eaDescription, eaDfsLink: eaDfsLink, eaCategory: eaCategoryWhole, eaID: layer.eaID.toString(), eaMetadata: eaMetadata, eaScale: eaScale, eaTags:eaTagsWhole, eaTopic:eaTopic};
						
						layerDataStore.newItem(layerItem);
						//add to hash map for update Search datatable column
						hashLayerName[layer.eaID.toString()] = layerName;
						hashEaDescription[layer.eaID.toString()] = eaDescription;
						hashEaTag[layer.eaID.toString()] = eaTagsWhole;
						
						//add to the table for use of search text		
			    	    var newRow   = tableRef.insertRow(tableRef.rows.length);
			    	    
		               	var newCell  = newRow.insertCell(0);
						newCell.appendChild(document.createTextNode(eaID));
						newRow.appendChild(newCell);
		
		               	newCell  = newRow.insertCell(1);
						newCell.appendChild(document.createTextNode(layerName));
						newRow.appendChild(newCell);			
		       
		               	newCell  = newRow.insertCell(2);
						newCell.appendChild(document.createTextNode(eaDescription));
						newRow.appendChild(newCell);
						
		               	newCell  = newRow.insertCell(3);
						newCell.appendChild(document.createTextNode(eaTagsWhole));
						newRow.appendChild(newCell);					
					
						//end of adding of the table for use of search text
			    
				    }// end of if (eaID.trim() != "")
                }// end of if(layer.hasOwnProperty('eaID'))                	

            }// end of for (index = 0, len = arrLayers.length; index < len; ++index) 
            updateTopicToggleButton();
            updateSearchBoxDataTable();

        });// end of loadJSON(function(response)
        loadCommunityJSON(function(response){
        	var community = JSON.parse(response);

            for (index = 0, len = community.length; index < len; ++index) {
            	currentMetadataCommunityIndex = community[index];
            	singleCommunityMetadataDic = {};
            	for (var key in window.communityDic) {
            		if(currentMetadataCommunityIndex.hasOwnProperty(key)) {
            			singleCommunityMetadataDic[key] = currentMetadataCommunityIndex[key];
            		}
            	}

            	window.communityMetadataDic[currentMetadataCommunityIndex.MetaID_Community] = singleCommunityMetadataDic;
            }
        }); // end of loadCommunityJSON(function(response)

    },               
                    
	    _onSingleLayerClick: function() {
		    this.publishData({
		        message: singleLayerToBeAddedRemoved
		    });
		},
	    _onViewActiveLayersClick: function() {

			//var sideBar =  wm.getWidgetById('themes_TabTheme_widgets_SidebarController_Widget_20');
			//sideBar.selectTab(0);				

			this.openWidgetById('widgets_SelectCommunity_29');
			var wm = WidgetManager.getInstance();
			widget = wm.getWidgetById('widgets_SelectCommunity_29');
			if (widget != undefined){
				var pm = PanelManager.getInstance();   
				pm.showPanel(widget);  
			}    
	    },	
    _onAddLayersClick: function() {
        layersToBeAdded = "a";
		for (var key in chkIdDictionary) {
		  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
		  	if (document.getElementById(key).checked) {
            	layersToBeAdded = layersToBeAdded + "," + key.replace("ck", "");
        	}
		  }
		}
        this.publishData({
	        message: layersToBeAdded
	    });
	    this.i ++;
    },
    _onRemLayersClick: function() {
        layersToBeAdded = "r";
		for (var key in chkIdDictionary) {
		  if ((chkIdDictionary.hasOwnProperty(key)) && (document.getElementById(key)!=null) ){
            	layersToBeAdded = layersToBeAdded + "," + key.replace("ck", "");
		  }
		}
        this.publishData({
	        message: layersToBeAdded
	    });
	    this.i ++;
    },    
	    
    _onRemoveLayersClick: function() {
        layersToBeRemoved = "r";
		for (var key in chkIdDictionary) {
		  if (chkIdDictionary.hasOwnProperty(key)) {
		  	if (document.getElementById(key).checked) {
            	layersToBeRemoved = layersToBeRemoved + "," + key.replace("ck", "") ;
        	}
		  }
		}
        this.publishData({
	        message: layersToBeRemoved
	    });
	    this.i ++;
    },
    });

    return clazz;
  });
