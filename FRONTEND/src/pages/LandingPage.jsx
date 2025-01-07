import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom'

function Landing() {
    
    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2 style={{color: "#f72585"}}>Connectify</h2>
                </div>
                <div className='navList'>
                    <p>Join as Guest</p>
                    <p>Register</p>
                    <div role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className='leftBox'>
                    <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved Once</h1>
                    <p>Cover a distance by Connectify</p>
                    <div role='button'>
                        <Link to={"/auth"} style={{textDecoration: "none", color: "white", fontSize: "1.5rem"}}>Get Started!!</Link>
                    </div>
                </div>
                <div className='rightBox'>
                    <img src="/vcallphoto.jpg" alt="" />
                </div>
            </div>

        </div>
    )
}

export default Landing
