let isDragging = false;
let offsetX, offsetY;
let activeWindow = null;

document.addEventListener("mousedown", (event) => {
    const titleBar = event.target.closest(".title-bar");
            if (titleBar) {
                isDragging = true;
                activeWindow = titleBar.parentElement;
                offsetX = event.clientX - activeWindow.getBoundingClientRect().left;
                offsetY = event.clientY - activeWindow.getBoundingClientRect().top;
            }
        });

        document.addEventListener("mousemove", (event) => {
            if (isDragging && activeWindow) {
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;
                activeWindow.style.left = x + "px";
                activeWindow.style.top = y + "px";
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            activeWindow = null;
        });

        function closeWindow(windowId) {
            const window = document.getElementById(windowId);
            if (window) {
                window.remove();
            }
        }