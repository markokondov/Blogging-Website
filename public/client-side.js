window.addEventListener("load", function() {

  // tinyMCE editor with image upload button
    tinymce.init({
        selector: '#content',
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime table paste imagetools wordcount'

        ],
        branding: false,
        forced_root_block: false,
        toolbar: 'insert undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
        //enable title field in the Image dialog
        image_title: true,
        
        
        // enable automatic uploads of images represented by blob or data URIs
        automatic_uploads: true,
        // add filepicker
        file_picker_types: 'image',
        file_picker_callback: function (cb, value, meta) {
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.onchange = function () {
            var file = this.files[0];
            var reader = new FileReader();
            reader.onload = function () {
  
              var id = 'blobid' + (new Date()).getTime();
              var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
              var base64 = reader.result.split(',')[1];
              var blobInfo = blobCache.create(id, file, base64);
              blobCache.add(blobInfo);
              // call the callback and populate the Title field with the file name
              cb(blobInfo.blobUri(), { title: file.name });
            };
            reader.readAsDataURL(file);
          };
          input.click();
        },
        //Use the actual filename of the image instead of generating new one

        images_upload_base_path: './temp',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
    });
 
   
});

