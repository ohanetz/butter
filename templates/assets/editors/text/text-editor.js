/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

(function( Butter ) {

  Butter.Editor.register( "text", "load!{{baseDir}}templates/assets/editors/text/text-editor.html",
    function( rootElement, butter ) {

    var _this = this;

    var _rootElement = rootElement,
        _trackEvent,
        _butter = butter,
        _popcornOptions,
        _falseClick = function() {
          return false;
        },
        _trueClick = function() {
          return true;
        };

    /**
     * Member: setup
     *
     * Sets up the content of this editor
     *
     * @param {TrackEvent} trackEvent: The TrackEvent being edited
     */
    function setup( trackEvent ) {
      _trackEvent = trackEvent;
      _popcornOptions = _trackEvent.popcornOptions;

      var basicContainer = _rootElement.querySelector( ".editor-options" ),
          advancedContainer = _rootElement.querySelector( ".advanced-options" ),
          //variablesContainer = _rootElement.querySelector( ".variables-options" ),
          variablesContainer = _rootElement.querySelector( ".butter-variables-container" ),
          pluginOptions = {},
          pickers = {};
          
      window.EditorHelper.droppable(_trackEvent, basicContainer);
//      $(container).droppable({drop: function(event, ui) {
//          $(this).css("background-color", "red").html("Omer!");
//      }});

      function callback( elementType, element, trackEvent, name ) {
        pluginOptions[ name ] = { element: element, trackEvent: trackEvent, elementType: elementType };
      }

      function attachHandlers() {
        var key,
            option;

        function colorCallback( te, options, message, prop ) {
          var newOpts = {};
          if ( message ) {
            _this.setErrorState( message );
            return;
          } else {
            newOpts[ prop ] = options[ prop ];
            te.update( newOpts );
          }
        }
        function checkboxCallback( trackEvent, updateOptions, prop ) {
          if ( "background shadow".match( prop ) ) {
            if ( updateOptions[ prop ] ) {
              pickers[ prop ].classList.remove( "butter-disabled" );
              pickers[ prop ].onclick = _trueClick;
              pickers[ prop ].removeAttribute("disabled");
            } else {
              pickers[ prop ].classList.add( "butter-disabled" );
              pickers[ prop ].onclick = _falseClick;
              pickers[ prop ].setAttribute( "disabled", "true" );
            }
          }
          
          trackEvent.update( updateOptions );
        }

        for ( key in pluginOptions ) {
          if ( pluginOptions.hasOwnProperty( key ) ) {
            option = pluginOptions[ key ];

            if ( option.elementType === "select" ) {
              _this.attachSelectChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
            }
            else if ( option.elementType === "input" ) {
              if ( key === "linkUrl" ) {
                _this.createTooltip( option.element, {
                  name: "text-link-tooltip" + Date.now(),
                  element: option.element.parentElement,
                  message: "Links will be clickable when shared.",
                  top: "105%",
                  left: "50%",
                  hidden: true,
                  hover: false
                });
              }

              if ( option.element.type === "checkbox" ) {
                _this.attachCheckboxChangeHandler( option.element, option.trackEvent, key, checkboxCallback );
              } else if ( key === "fontColor" ) {
                _this.attachColorChangeHandler( option.element, option.trackEvent, key, colorCallback );
              } else if ( key === "backgroundColor" ) {
                pickers.background = option.element;
                // set initial state
                if ( !_popcornOptions.background ) {
                  option.element.classList.add( "butter-disabled" );
                  option.element.onclick = _falseClick;
                  option.element.setAttribute( "disabled", "true" );
                }
                _this.attachColorChangeHandler( option.element, option.trackEvent, key, colorCallback );
              } else if ( key === "shadowColor" ) {
                pickers.shadow = option.element;
                // set initial state
                if ( !_popcornOptions.shadow ) {
                  option.element.classList.add( "butter-disabled" );
                  option.element.onclick = _falseClick;
                  option.element.setAttribute( "disabled", "true" );
                }
                _this.attachColorChangeHandler( option.element, option.trackEvent, key, colorCallback );
              }
              else {
                _this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
              }
            }
            else if ( option.elementType === "textarea" ) {
              _this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
            }
          }
        }

        basicContainer.insertBefore( _this.createStartEndInputs( trackEvent, _this.updateTrackEventSafe ), basicContainer.firstChild );
      }

      // backwards comp
      if ( "center left right".match( _popcornOptions.position ) ) {
        _popcornOptions.alignment = _popcornOptions.position;
        _popcornOptions.position = "middle";
      }

      _this.createPropertiesFromManifest({
        trackEvent: trackEvent,
        callback: callback,
        basicContainer: basicContainer,
        advancedContainer: advancedContainer,
        ignoreManifestKeys: [ "start", "end" ]
      });
      
      displayEditor(_butter.config, variablesContainer, trackEvent);

      attachHandlers();
      _this.updatePropertiesFromManifest( trackEvent );
      _this.setTrackEventUpdateErrorCallback( _this.setErrorState );
    }

    function anchorClickPrevention( anchorContainer ) {
      if ( anchorContainer ) {
        
        anchorContainer.onclick = _falseClick;
      }
    }

    function onTrackEventUpdated( e ) {
      _trackEvent = e.target;

      var anchorContainer = _trackEvent.popcornTrackEvent._container.querySelector( "a" );
      anchorClickPrevention( anchorContainer );

      _this.updatePropertiesFromManifest( _trackEvent );
      _this.setErrorState( false );
    }

    // Extend this object to become a TrackEventEditor
    Butter.Editor.TrackEventEditor.extend( _this, butter, rootElement, {
      open: function( parentElement, trackEvent ) {
        var anchorContainer = trackEvent.popcornTrackEvent._container.querySelector( "a" );

        anchorClickPrevention( anchorContainer );

        _butter = butter;

        // Update properties when TrackEvent is updated
        trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
        setup( trackEvent );
      },
      close: function() {
        _trackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
      }
    });
    
    function displayEditor( config, variablesContainer, trackEvent ) {
        
        var variablesArray;
        
        $.getJSON("/loadVariables", function(variables) {
            
            if (variables.out == undefined) {
                return;
            }
            
            var variablesStr = variables.out;
            if ((variablesStr != null) 
                && (variablesStr.indexOf("[") > -1) && (variablesStr.indexOf("]") > -1 )) {

                variablesContainer.innerHTML = "";

                variablesStr = variablesStr.substring(variablesStr.indexOf("[") + 1, variablesStr.indexOf("]"));
                if (variablesStr.length > 0) {
                    variablesArray = variablesStr.split(", ");
                    variablesArray.forEach(function(variable) {
                       variableHTML = '<a id="' + variable + '_varName" href="#" draggable="true" class="butter-plugin-tile" data-butter-draggable-type="plugin">'
                           + '<span class="butter-plugin-icon" style="background-image: url(' + config.value("variables").icon + ');">'
                           + '</span><span class="butter-plugin-label">' + variable + '</span></a>';
                       variablesContainer.innerHTML += variableHTML;

                    });
                }
            }
        }).complete(function() {
            
            if (variablesArray === undefined) {
                return;
            }
            
            if (variablesArray != null) {
                variablesArray.forEach(function(variable) {
                    $("#" + variable + "_varName").click(function() {
                        var updateOptions = {};
                        updateOptions["variable"] = variable;
                        trackEvent.update(updateOptions);
                   });
                })
            }
        });

    }
  });
}( window.Butter ));
