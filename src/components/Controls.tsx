import React, { useState, useEffect } from "react";

function Controls(keyFunction : Function) {
     
    const waitForKeyPress = () => {
        return new Promise((resolve) => {
          const handleKeyDown = (event) => {
            resolve(event.key); // Resolve the promise with the pressed key
            window.removeEventListener("keydown", handleKeyDown); // Clean up
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