(function (qd) {

    /**
     * qd.Input.Touch
     *
     * @constructor
     */
    qd.Touch = function () {
        this.x = null;
        this.y = null;
        this.event = null;
    };

    /**
     * Builds a {qd.Input.Touch} that captures the touch position
     * and touch events on a touch device.
     *
     * @param element
     * @return {qd.Input.Touch}
     */
    qd.Touch.build = function (element) {
        var touch = new qd.Touch(),
            touchContainer = (element || window),
            bodyScrollLeft = document.body.scrollLeft,
            elementScrollLeft = document.documentElement.scrollLeft,
            bodyScrollTop = document.body.scrollTop,
            elementScrollTop = document.documentElement.scrollTop,
            offsetLeft = touchContainer.offsetLeft,
            offsetTop = touchContainer.offsetTop;

        touchContainer.addEventListener('touchstart', function (event) {
            touch.isPressed = true;
            touch.event = event;
        }, false);

        touchContainer.addEventListener('touchend', function (event) {
            touch.isPressed = false;
            touch.x = null;
            touch.y = null;
            touch.event = event;
        }, false);

        touchContainer.addEventListener('touchmove', function (event) {
            var x, y,
                touchEvent = event.touches[0]; //first touch

            if (touchEvent.pageX || touchEvent.pageY) {
                x = touchEvent.pageX;
                y = touchEvent.pageY;
            } else {
                x = touchEvent.clientX + bodyScrollLeft + elementScrollLeft;
                y = touchEvent.clientY + bodyScrollTop + elementScrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;

            touch.x = x;
            touch.y = y;
            touch.event = event;
        }, false);

        return touch;
    };

}(qd));
