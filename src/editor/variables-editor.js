/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define([ "editor/editor", "editor/base-editor",
          "text!layouts/variables-editor.html", "util/social-media", "ui/widget/textbox" ],
  function( Editor, BaseEditor, LAYOUT_SRC, SocialMedia, TextboxWrapper ) {

  Editor.register( "variables-list", LAYOUT_SRC, function( rootElement, butter ) {
    var socialMedia = new SocialMedia(),
        editorContainer = rootElement.querySelector( ".editor-container" ),
        projectURL = editorContainer.querySelector( ".butter-project-url" ),
        authorInput = editorContainer.querySelector( ".butter-project-author" ),
        projectEmbedURL = editorContainer.querySelector( ".butter-project-embed-url" ),
        embedSize = editorContainer.querySelector( ".butter-embed-size" ),
        shareTwitter = editorContainer.querySelector( ".butter-share-twitter" ),
        shareGoogle = editorContainer.querySelector( ".butter-share-google" ),
        embedDimensions = embedSize.value.split( "x" ),
        embedWidth = embedDimensions[ 0 ],
        embedHeight = embedDimensions[ 1 ];

    authorInput.value = butter.project.author ? butter.project.author : "";

    function updateEmbed( url ) {
      projectEmbedURL.value = "<iframe src='" + url + "' width='" + embedWidth + "' height='" + embedHeight + "'" +
      " frameborder='0' mozallowfullscreen webkitallowfullscreen allowfullscreen></iframe>";
    }
    
    function omerTest() {
        $.getJSON("/loadVariables", function(variables) {
            projectEmbedURL.value = variables.out;
//                $.each(variables, function() {  
//                    $("<li>").html(this.text).prependTo(tweet_list);  
//                });
        });
    }

    function displayEditor( on ) {
      omerTest();
      var project = butter.project;

      if ( project.id ) {
        embedSize.disabled = !on;
        authorInput.disabled = !on;

        if ( on ) {
          editorContainer.classList.remove( "fade-container" );

          projectURL.value = project.publishUrl;
          togglePreviewButton( on );
          toggleViewSourceButton( on );

          updateEmbed( project.iframeUrl );

          // if any of the buttons haven't loaded, or if we aren't logged in
          if ( !shareTwitter.childNodes.length ||
               !shareGoogle.childNodes.length ) {
            socialMedia.hotLoad( shareTwitter, socialMedia.twitter, project.publishUrl );
            socialMedia.hotLoad( shareGoogle, socialMedia.google, project.publishUrl );
          }
        } else {
          //editorContainer.classList.add( "fade-container" );
          omerTest();
        }
      }
    }

    embedSize.addEventListener( "change", function() {
      embedDimensions = embedSize.value.split( "x" );
      embedWidth = embedDimensions[ 0 ];
      embedHeight = embedDimensions[ 1 ];
      updateEmbed( butter.project.iframeUrl );
    }, false);

    authorInput.addEventListener( "blur", function() {
      if ( authorInput.value !== butter.project.author ) {
        butter.project.author = authorInput.value;
        butter.project.save(function() {
          butter.editor.openEditor( "variables-list" );
        });
      }
    }, false );

    butter.listen( "logout", function onLogout() {
      displayEditor( false );
      togglePreviewButton( false );
      toggleViewSourceButton( false );
    });

    butter.listen( "authenticated", function onAuthenticated() {
      displayEditor( true );
    });

    butter.listen( "projectsaved", function onSaved() {
      togglePreviewButton( true );
      toggleViewSourceButton( true );
    });

    butter.listen( "projectchanged", function onChanged() {
      togglePreviewButton( false );
      toggleViewSourceButton( false );
    });

    TextboxWrapper.applyTo( projectURL, { readOnly: true } );
    TextboxWrapper.applyTo( projectEmbedURL, { readOnly: true } );
    TextboxWrapper.applyTo( authorInput );

    Editor.BaseEditor.extend( this, butter, rootElement, {
      open: function() {
        displayEditor( butter.cornfield.authenticated() );
      },
      close: function() {
      }
    });
  }, true );
});
