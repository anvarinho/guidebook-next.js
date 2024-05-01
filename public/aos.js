// Add a class to trigger the animation when the element is in the viewport
document.addEventListener('DOMContentLoaded', function () {
    var zoomInElements = document.querySelectorAll('.placeBox');
    var windowHeight = window.innerHeight;
  
    function animateOnScroll() {
      zoomInElements.forEach(function (element) {
        var boundingRect = element.getBoundingClientRect();
        var top = boundingRect.top;
  
        if (top <= windowHeight * 0.8) {
          element.classList.add('appear');
        }
      });
    }
  
    animateOnScroll();
  
    window.addEventListener('scroll', animateOnScroll);
  });