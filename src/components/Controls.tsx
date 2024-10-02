function Controls(keyFunction : Function) {
     
    const waitForKeyPress = () => {
        return new Promise((resolve) => {
          const handleKeyDown = (event: { key: unknown; }) => {
            resolve(event.key); 
            window.removeEventListener("keydown", handleKeyDown); 
          };
    
          window.addEventListener("keydown", handleKeyDown);
        });
    };

    const setControlKey = async () => {
        const pressedKey = await waitForKeyPress();
        keyFunction(pressedKey);
        console.log(`Control set to: ${pressedKey}`);
    };
    setControlKey()
}



export default Controls;