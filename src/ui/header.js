define([ "dialog/dialog", "util/lang", "text!layouts/header.html", "ui/user-data", "ui/widget/tooltip" ],
  function( Dialog, Lang, HEADER_TEMPLATE, UserData, ToolTip ) {

  return function( butter, options ){

    options = options || {};

    var TOOLTIP_NAME = "name-error-header-tooltip";

    var _this = this,
        _userData = new UserData( butter, options ),
        _rootElement = Lang.domFragment( HEADER_TEMPLATE, ".butter-header" ),
        _saveButton = _rootElement.querySelector( ".butter-save-btn" ),
        _projectTitle = _rootElement.querySelector( ".butter-project-title" ),
        _projectName = _projectTitle.querySelector( ".butter-project-name" ),
        _clearEvents = _rootElement.querySelector( ".butter-clear-events-btn" ),
        _previewBtn = _rootElement.querySelector( ".butter-preview-btn" ),
        _shareBtn = _rootElement.querySelector( ".butter-share-btn" ),
        _projectMenu = _rootElement.querySelector( ".butter-project-menu" ),
        _projectMenuControl = _rootElement.querySelector( ".butter-project-menu-control" ),
        _projectMenuList = _projectMenu.querySelector( ".butter-btn-menu" ),
        _noProjectNameToolTip,
        _projectTitlePlaceHolderText = _projectName.innerHTML,
        _toolTip,
        _dataSourcesList = _rootElement.querySelector( ".butter-pic-datasources" );

    // create a tooltip for the plrojectName element
    _toolTip = ToolTip.create({
      title: "header-title-tooltip",
      message: "Change the name of your project",
      element: _projectTitle,
      top: "60px"
    });

    _this.element = _rootElement;

    ToolTip.apply( _projectTitle );

    function saveProject() {
        if (_dataSourcesList.options.length > 0) {
            $.get("/setDataSource", {dataSource: _dataSourcesList.options[_dataSourcesList.selectedIndex].value}, function() {

            }).complete(function() {
                prepare();
            });
        
        } else {
            // Not using datasources.
            prepare();
        }
//      if ( !butter.cornfield.authenticated() ) {
//        _userData.authenticationRequired();
//      }
//      else if ( butter.project.isSaved ) {
//        return;
//      }
//      else if ( checkProjectName( butter.project.name ) ) {
//        _userData.authenticationRequired( prepare, nameError );
//        return;
//      }
//      else {
//        nameError();
//      }
    }
    
    var dataSourcesArray;

    $.getJSON("/loadDataSources", function(dataSources) {

        if (dataSources.out == undefined) {
            return;
        }

        var dataSourcesStr = dataSources.out;
        if ((dataSourcesStr != null) 
            && (dataSourcesStr.indexOf("[") > -1) && (dataSourcesStr.indexOf("]") > -1 )) {

            _dataSourcesList.innerHTML = '<option value="0">None</option>';

            dataSourcesStr = dataSourcesStr.substring(dataSourcesStr.indexOf("[") + 1, dataSourcesStr.indexOf("]"));
            if (dataSourcesStr.length > 0) {
                dataSourcesArray = dataSourcesStr.split(", ");
                dataSourcesArray.forEach(function(dataSource) {
                    if (dataSource.indexOf("###") > -1) {
                        var dsDetails = dataSource.split("###");
                        _dataSourcesList.innerHTML += '<option value="' + dsDetails[0] + '">' + dsDetails[1] + '</option>';
                    }
                });
            }
        }
//    }).complete(function() {
//
//        if (dataSourcesArray === undefined) {
//            return;
//        }
//
//        if (dataSourcesArray != null) {
//            dataSourcesArray.forEach(function(variable) {
//                $("#" + variable + "_varName").click(function() {
//                    var updateOptions = {};
//                    updateOptions["variable"] = variable;
//                    trackEvent.update(updateOptions);
//               });
//            })
//        }
    });
    
    
    _dataSourcesList.addEventListener("change", function() {
//        $.get("/setDataSource", {dataSource: _dataSourcesList.options[_dataSourcesList.selectedIndex].value}, function() {
//            butter.project.dataSourceId = _dataSourcesList.options[_dataSourcesList.selectedIndex].value;
//            butter.project.isSaved = false;
//            _userData.authenticationRequired(prepare);
//        });
        butter.project.isSaved = false;
        saveProject();
    });
    


    function openShareEditor() {
      butter.editor.openEditor( "share-properties" );
    }

    function toggleSaveButton( on ) {
      if ( on ) {
        _saveButton.classList.remove( "butter-disabled" );
        _saveButton.addEventListener( "click", saveProject, false );
      } else {
        _saveButton.classList.add( "butter-disabled" );
        _saveButton.removeEventListener( "click", saveProject, false );
      }
    }

    function togglePreviewButton( on ) {
      if ( on ) {
        _previewBtn.classList.remove( "butter-disabled" );
        _previewBtn.href = butter.project.previewUrl;
        _previewBtn.onclick = function() {
          return true;
        };
      } else {
        _previewBtn.classList.add( "butter-disabled" );
        _previewBtn.href = "";
        _previewBtn.onclick = function() {
          return false;
        };
      }
    }

    function toggleClearButton( on ) {
      if ( on ) {
        _clearEvents.classList.remove( "butter-disabled" );
        _clearEvents.addEventListener( "click", clearEventsClick, false );
      } else {
        _clearEvents.classList.add( "butter-disabled" );
        _clearEvents.removeEventListener( "click", clearEventsClick, false );
      }
    }

    function toggleShareButton( on ) {
      if ( on ) {
        _shareBtn.classList.remove( "butter-disabled" );
        _shareBtn.addEventListener( "click", openShareEditor, false );
      } else {
        _shareBtn.classList.add( "butter-disabled" );
        _shareBtn.removeEventListener( "click", openShareEditor, false );
      }
    }

    function projectNameClick() {
      var input = document.createElement( "input" );

      input.type = "text";

      input.placeholder = _projectTitlePlaceHolderText;
      input.classList.add( "butter-project-name" );
      input.value = _projectName.textContent !== _projectTitlePlaceHolderText ? _projectName.textContent : "";
      _projectTitle.replaceChild( input, _projectName );
      _projectTitle.removeEventListener( "click", projectNameClick, false );
      input.focus();
      input.addEventListener( "blur", onBlur, false );
      input.addEventListener( "keypress", onKeyPress, false );
    }

    function clearEventsClick() {
      var dialog;
      if ( butter.currentMedia && butter.currentMedia.hasTrackEvents() ) {
        dialog = Dialog.spawn( "delete-track-events", {
          data: butter
        });
        dialog.open();
      }
    }

    this.views = {
      dirty: function() {
        togglePreviewButton( false );
        toggleSaveButton( true );
        toggleShareButton( false );
      },
      clean: function() {
        togglePreviewButton( true );
        toggleSaveButton( false );
        toggleShareButton( true );
      },
      login: function() {
        if (butter.project != null) {
          var isSaved = butter.project.isSaved;
        }

        _previewBtn.style.display = "";
        _projectTitle.style.display = "";
        _saveButton.innerHTML = "Save";

        togglePreviewButton( isSaved );
        toggleSaveButton( !isSaved );
        toggleShareButton( isSaved );
      },
      logout: function() {
        togglePreviewButton( false );
        toggleSaveButton( true );
        toggleShareButton( false );
        _previewBtn.style.display = "none";
        _projectTitle.style.display = "none";
        _saveButton.innerHTML = "Sign in to save";
      },
      mediaReady: function() {
        toggleSaveButton( true );
        _toolTip.hidden = false;
        _projectTitle.classList.remove( "butter-disabled" );
        _projectTitle.addEventListener( "click", projectNameClick, false );
        _projectName.addEventListener( "click", projectNameClick, false );
      },
      mediaChanging: function() {
        toggleSaveButton( false );
        _toolTip.hidden = true;
        _projectTitle.classList.add( "butter-disabled" );
        _projectTitle.removeEventListener( "click", projectNameClick, false );
        _projectName.removeEventListener( "click", projectNameClick, false );
      }
    };

    // Set up the project menu
    _projectMenuControl.addEventListener( "click", function() {
      if ( butter.currentMedia.hasTrackEvents() ) {
        toggleClearButton( true );
      } else {
        toggleClearButton( false );
      }
      _projectMenu.classList.toggle( "butter-btn-menu-expanded" );
    }, false );

    _projectMenuList.addEventListener( "click", function( e ) {
      if ( e.target.classList.contains( "butter-disabled" ) ) {
        return;
      }
      _projectMenu.classList.remove( "butter-btn-menu-expanded" );
    }, true );

    function feedbackCallback() {
      var dialog = Dialog.spawn( "feedback" );
      dialog.open();
    }
    

    function destroyToolTip() {
      if ( _noProjectNameToolTip && !_noProjectNameToolTip.destroyed ) {
        _projectTitle.removeEventListener( "mouseover", destroyToolTip, false );
        _noProjectNameToolTip.destroy();
      }
    }

    function prepare() {
      function afterSave() {
        butter.editor.openEditor( "share-properties" );
        togglePreviewButton( true );
      }

      if ( !butter.project.isSaved ) {
        toggleSaveButton( false );

        // If saving fails, restore the "Save" button so the user can try again.
        _userData.save( function() { afterSave(); },
                        function() { toggleSaveButton( true );
                                     togglePreviewButton( false ); } );
      } else {
        afterSave();
      }
    }

    function onKeyPress( e ) {
      var node = _projectTitle.querySelector( ".butter-project-name" );

      // if this wasn't the 'enter' key, return early
      if ( e.keyCode !== 13 ) {
        return;
      }

      node.blur();
      node.removeEventListener( "keypress", onKeyPress, false );
    }

    /*
     * Function: checkProjectName
     *
     * Checks whether the current projects name is a valid one or not.
     * @returns boolean value representing whether or not the current project name is valid
     */
    function checkProjectName( name ) {
      return !!name && name !== _projectTitlePlaceHolderText;
    }

    function nameError() {
      destroyToolTip();

      _projectTitle.addEventListener( "mouseover", destroyToolTip, false );

      ToolTip.create({
        name: TOOLTIP_NAME,
        message: "Please give your project a name before saving",
        hidden: false,
        element: _projectTitle,
        top: "50px",
        error: true
      });

      _noProjectNameToolTip = ToolTip.get( TOOLTIP_NAME );
    }

    function onBlur() {
      var node = _projectTitle.querySelector( ".butter-project-name" );
      node.removeEventListener( "blur", onBlur, false );

      _projectName.textContent = node.value || _projectTitlePlaceHolderText;
      if( checkProjectName( _projectName.textContent ) ) {
        butter.project.name = _projectName.textContent;
        _userData.authenticationRequired( prepare );
      } else {
        nameError();
      }

      _projectTitle.replaceChild( _projectName, node );
    }

    this.attachToDOM = function() {
      document.body.classList.add( "butter-header-spacing" );
      document.body.insertBefore( _rootElement, document.body.firstChild );
    };

    butter.listen( "autologinsucceeded", _this.views.login, false );
    butter.listen( "authenticated", _this.views.login, false );
    butter.listen( "logout", _this.views.logout, false );
    butter.listen( "mediaready", _this.views.mediaReady );
    butter.listen( "mediacontentchanged", _this.views.mediaChanging );

    butter.listen( "projectsaved", function() {
      // Disable "Save" button
      _this.views.clean();
      _projectName.textContent = butter.project.name;
      _projectTitle.addEventListener( "click", projectNameClick, false );
    });

    butter.listen( "projectchanged", function() {
      // Re-enable "Save" button to indicate things are not saved
      _this.views.dirty();
    });

    butter.listen( "ready", function() {
      if ( butter.project.name ) {
        _projectName.textContent = butter.project.name;
      }
      
      if ( butter.project.dataSourceId ) {
        for (var i=0; i<_dataSourcesList.length; i++){
            if (_dataSourcesList.options[i].value == butter.project.dataSourceId) {
                _dataSourcesList.options[i].selected = true;
            }
        }  

        butter.project.isSaved = false;
        saveProject();
      }
    });


    // Logging in using demo user.
    _this.views.login( "Omer" );

  };
});
