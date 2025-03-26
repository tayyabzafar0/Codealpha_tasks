// <-------------------------------------------------- handburger sign-------------------------->

const handburgerMenu = document.querySelector(".handburger-menu");
const navList = document.querySelector('.nav-list');

handburgerMenu.addEventListener('click', ()=>{
    navList.classList.toggle('show');
})











// <-------------------------------------------gsap animation----------------------------------->


// //////////////////////////////////-------- hero section--------\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// <================================== timeline =====================================>

const hero_tl = gsap.timeline({
    scrollTrigger : {
        trigger : '.hero-section',
        start : 'top top',
        end : '+=400px',
        scrub : 2,
        pin: true
    }
});

// <================================= iterate span tag ============================>

document.querySelectorAll('.hero-section .hero-content .title span').forEach((span , index)=>{
    hero_tl.to(span, {
        y: -1500,
        duration : 4, 
        ease: "power1.out"
    }, index * 0.1 )
});


gsap.to('.hero-section', {
    y: -1200, duration:4 , ease: "power1.out",
    scrollTrigger : {
        trigger : '.hero-section',
        start : 'top top',
        end : '+=800px',
        scrub : 2,
        pin: true
    }
});



// <====================== hero animation======================>
    
const lenis = new Lenis({
    duration: 3,

});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  
  requestAnimationFrame(raf);


//  <=============================== horizantal section===========================>


let horizantalSection = document.querySelector('.horizantal');

gsap.to(horizantalSection , {
    x : () => horizantalSection.scrollWidth * -1,
    xPercent : 100,
    scrollTrigger : {
        trigger : horizantalSection,
        start : 'center center',
        end : '+=2000px',
        scrub : 2,
        pin: "#horizantal-scroll",
        invalidOnRefresh: true
    }

});

//  <=============================== about section===========================>

const textElements = gsap.utils.toArray('.text');

textElements.forEach(text => {
    gsap.to(text, {
        backgroundSize : "100%",
        ease : "none",
        scrollTrigger : {
            trigger : text,
            start: 'center 80%',
            end : 'center 30%',
            scrub : true
        }
    })
})



const parallax = document.querySelector('.parallax');

gsap.to(parallax, {
    backgroundPosition : '0px 100%',
    ease : 'none',
    duration : 4,
    scrollTrigger : {
        trigger : parallax,
        start: '-60% top',
        end : 'bottom bottom',
        scrub : true
    }
})

//  <=============================== footer section===========================>



gsap.to("#footer .flex .wrapper h1", {
    y : 0,
    duration : 4,
    scrollTrigger : {
        trigger : '#footer .flex .wrapper h1',
        start: 'top 60%',
        end : 'bottom 60%',
        scrub : 4
    }
})




