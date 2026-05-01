import React from 'react'
import './Header.css'

function Header() {
    return (
        <header>
            <div id='header-container-menu'>
                <div id='button-actions'>Akce</div>
                <div id='button-home'>
                    <p>Domů</p>
                </div>
                <img src='src\assets\logo_small.svg' id='logo-small-home' alt='Logo stránky Event Hub'/>
            </div>
            <div id='header-container-logo'>
                <img src='src\assets\logo_big.svg' id='logo-big-home' alt='Logo stránky Event Hub'></img>
            </div>
        </header>
    )
}

export default Header