(function(){
  if(window.BFCPE_LIGHTBOX_LOADED){ return; }
  window.BFCPE_LIGHTBOX_LOADED = true;

  function findSectionElements(trigger){
    var root = trigger.closest('.bfc-editorial');
    if(!root){ return {}; }
    var dialog = root.querySelector('dialog.bfcpe-lightbox');
    var image = dialog ? dialog.querySelector('img') : null;
    return { root: root, dialog: dialog, image: image };
  }

  document.addEventListener('click', function(event){
    var opener = event.target.closest('[data-lightbox]');
    if(opener){
      var section = findSectionElements(opener);
      if(section.dialog && section.image){
        event.preventDefault();
        try {
          var dataset = opener.dataset;
          var src = dataset.lightbox || opener.getAttribute('href');
          if(!src){ return; }

          section.image.src = src;

          if(dataset.lightboxWidth){
            section.image.setAttribute('width', dataset.lightboxWidth);
          }

          if(dataset.lightboxHeight){
            section.image.setAttribute('height', dataset.lightboxHeight);
          }

          if(dataset.lightboxAlt !== undefined){
            section.image.alt = dataset.lightboxAlt;
          }

          section.dialog.showModal();
        } catch(err){
          console.warn('BFC Editorial lightbox failed to open', err);
        }
      }
      return;
    }

    var closer = event.target.closest('[data-lightbox-close]');
    if(closer){
      var dlg = closer.closest('dialog.bfcpe-lightbox');
      if(dlg){
        event.preventDefault();
        try {
          dlg.close();
        } catch(err){
          console.warn('BFC Editorial lightbox failed to close', err);
        }
      }
    }
  });
})();