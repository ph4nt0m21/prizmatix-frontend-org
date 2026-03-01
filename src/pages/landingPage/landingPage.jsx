import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ChevronRight, ChevronDown, BarChart3, Ticket, Expand, Users, ShieldCheck, Mail, ArrowRight, Headset } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Preloader = ({ onComplete }) => {
    const text = "Ticketing like never before.";
    const words = text.split(" ");
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
            <div className="text-center relative overflow-hidden">
                <motion.div
                    className="text-3xl md:text-5xl font-heading font-bold text-white flex space-x-3 overflow-hidden px-4"
                    initial="hidden"
                    animate="visible"
                    onAnimationComplete={() => setTimeout(onComplete, 800)}
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                        hidden: {}
                    }}
                >
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            className="inline-block relative"
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.div>
                <motion.div
                    className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 mix-blend-screen"
                    initial={{ x: "-100%" }}
                    animate={{ x: "300%" }}
                    transition={{ duration: 1.2, ease: "linear", delay: 0.8 }}
                />
            </div>
        </motion.div>
    );
};

const Navbar = () => {
    const { scrollY } = useScroll();
    const [isHeroUnderneath, setIsHeroUnderneath] = useState(true);

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Toggle background morphology when scrolling past Hero
        if (latest > 100) {
            setIsHeroUnderneath(false);
        } else {
            setIsHeroUnderneath(true);
        }
    });

    return (
        <motion.nav
            className={`fixed top-4 md:top-6 left-1/2 z-40 w-[95%] max-w-5xl h-16 rounded-full flex items-center justify-between px-6 transition-all duration-500 ease-in-out -translate-x-1/2 ${isHeroUnderneath
                ? "bg-transparent text-white border border-transparent shadow-none"
                : "backdrop-blur-md bg-black/60 border border-white/10 shadow-xl text-white"
                }`}
        >
            <img
                src="/Prizmatix_logo.svg"
                alt="Prizmatix Logo"
                className={`h-8 w-auto my-2 object-contain transition-all duration-500`}
            />
            <div className="flex items-center gap-1 md:gap-4">
                <Link
                    to="/login"
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-300 ${isHeroUnderneath ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Login
                </Link>
                <Link
                    to="/register"
                    className={`group relative overflow-hidden flex items-center gap-2 px-5 py-2 text-sm rounded-full font-bold transition-all shadow-lg ${isHeroUnderneath
                        ? "bg-white/10 hover:bg-white text-white hover:text-black border border-white/20"
                        : "bg-accent/20 border border-accent/50 text-white hover:bg-accent neon-glow"
                        }`}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Create Event <ChevronRight size={16} />
                    </span>
                    {/* Liquid Shine Element */}
                    <div className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-700 ease-out z-0" />
                </Link>
            </div>
        </motion.nav>
    );
};

const Hero = () => {
    const { scrollY } = useScroll();
    const scale = useTransform(scrollY, [0, 150], [1, 0.90]);
    const borderRadius = useTransform(scrollY, [0, 150], ["0px", "50px"]);

    const videos = [
        "/hero-bg-1.mp4",
        "/hero-bg-2.mp4"
    ];
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const words = ["Noise", "Hassle", "Chaos", "Friction", "Limits"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const container = useRef();

    useGSAP(() => {
        gsap.from(".hero-anim", {
            y: 50,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.8
        });
    }, { scope: container });

    return (
        <section className="relative h-[150vh] bg-background" ref={container}>
            <div className="sticky top-0 h-screen w-full flex items-center justify-center p-0 md:p-4">
                <motion.div
                    style={{ scale, borderRadius }}
                    className="absolute inset-0 md:inset-4 origin-center bg-[#0a0a0a] overflow-hidden"
                >
                    <video
                        key={currentVideoIndex}
                        autoPlay
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-lighten opacity-30"
                    >
                        <source src={videos[currentVideoIndex]} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </motion.div>

                <div
                    className="relative z-10 flex flex-col items-center text-center px-6 mt-20 pointer-events-none"
                >
                    <h1
                        className="hero-anim text-5xl md:text-8xl font-heading font-bold text-white mb-6 leading-[1.1] tracking-tight pointer-events-auto flex flex-col items-center"
                    >
                        <span>Ticketing Without</span>
                        <div className="flex items-center justify-center mt-2 h-16 md:h-28">
                            <span className="text-white mr-4 md:mr-6 text-right w-24 md:w-32">the</span>
                            <div className="relative w-64 md:w-96 h-full flex items-center overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentWordIndex}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-white to-accent absolute left-0 pr-4"
                                    >
                                        {words[currentWordIndex]}.
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </h1>
                    <p
                        className="hero-anim text-lg md:text-xl text-gray-400 max-w-2xl font-sans mb-10 leading-relaxed pointer-events-auto"
                    >
                        The all-in-one command center for New Zealand’s event creators. From intimate workshops to massive festivals.
                    </p>
                    <div className="hero-anim flex gap-4 pointer-events-auto">
                        <Link
                            to="/register"
                            className="group relative overflow-hidden bg-accent text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 transition-colors shadow-[0_0_40px_rgba(159,32,255,0.4)]"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Start Organizing Free <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
                            </span>
                            <div className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-700 ease-out z-0" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ParallaxGrittyTypography = () => {
    const container = useRef();
    const bgRef = useRef();
    const topGroupRef = useRef();
    const bottomGroupRef = useRef();

    useGSAP(() => {
        // Background Parallax
        gsap.to(bgRef.current, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: container.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Staggered fade up for the top text group
        gsap.from(topGroupRef.current.children, {
            scrollTrigger: {
                trigger: container.current,
                start: "top 60%", // Start early
                end: "center center",
                scrub: 1
            },
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        });

        // Staggered fade up for the bottom text group (delayed)
        gsap.from(bottomGroupRef.current.children, {
            scrollTrigger: {
                trigger: container.current,
                start: "top 35%", // Start later! User must scroll further.
                end: "bottom 80%",
                scrub: 1
            },
            y: 50,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        });

    }, { scope: container });

    return (
        <section ref={container} className="relative min-h-[140vh] w-full overflow-hidden flex items-center justify-center bg-black py-32">
            {/* Parallax Background Image */}
            <div
                ref={bgRef}
                className="absolute top-[-20%] left-0 w-full h-[140%] bg-cover bg-center bg-no-repeat opacity-[0.15] mix-blend-luminosity"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
                }}
            />
            {/* Dark Gradient Overlays for seamless integration */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-black/80 to-background" />

            <div className="relative z-10 px-6 max-w-5xl mx-auto text-center flex flex-col items-center justify-center">
                {/* TOP GROUP: Early Reveal */}
                <div ref={topGroupRef} className="flex flex-col items-center justify-center gap-4 w-full">
                    <span className="text-accent font-sans font-medium text-sm md:text-base tracking-widest uppercase mb-2">
                        The Modern Solution
                    </span>

                    <h2 className="text-2xl md:text-4xl font-heading font-medium text-gray-400 tracking-tight leading-tight">
                        Stop asking
                    </h2>

                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold italic text-white tracking-tight leading-tight">
                        "Why aren't we sold out?"
                    </h3>
                </div>

                {/* BOTTOM GROUP: Delayed Reveal */}
                <div ref={bottomGroupRef} className="flex flex-col items-center justify-center gap-4 w-full mt-12">
                    {/* Vertical Divider Line */}
                    <div className="w-px h-24 md:h-40 bg-gradient-to-b from-white/10 via-accent/50 to-transparent my-4 origin-top" />

                    <h2 className="text-2xl md:text-4xl font-heading font-bold text-white tracking-tight leading-tight mt-4">
                        Start asking
                    </h2>

                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold italic text-accent drop-shadow-[0_0_30px_rgba(159,32,255,0.4)] tracking-tighter leading-tight">
                        "What is Optimal?"
                    </h3>

                    <p className="text-gray-400 font-sans text-base md:text-lg max-w-2xl mt-8 leading-relaxed">
                        Prizmatix provides a streamlined solution for music event organizers, addressing their unique management needs.
                    </p>
                </div>
            </div>
        </section>
    );
};

const TabbedFeatures = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const features = [
        {
            heading: "Real-Time Analytics",
            description: "Track ticket sales, revenue, and attendee insights with live dashboards and detailed reporting.",
            image: "/dashboard-mockup-1.png"
        },
        {
            heading: "E-Mail Campaigns",
            description: "Easily keep your audience informed and engaged with live updates and tailored campaigns about your upcoming event, tracking ticket sales and attendee insights in real-time.",
            image: "/dashboard-mockup-2.png"
        },
        {
            heading: "Seamless Check-In",
            description: "Lightning-fast QR code scanning and contactless entry with real-time capacity monitoring.",
            image: "/dashboard-mockup-3.png"
        }
    ];

    useEffect(() => {
        if (isHovering) return;

        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isHovering, features.length]);

    return (
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto w-full relative z-10">
            <div className="mb-20 space-y-4">
                <span className="text-accent font-bold tracking-[0.2em] uppercase text-sm">Features</span>
                <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white text-shadow-sm">
                    Transform Your Events with Prizmatix
                </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
                {/* Left Side: Tabs */}
                <div className="w-full md:w-5/12 space-y-6 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 rounded-full" />

                    <div
                        className="space-y-2 relative"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`relative pl-8 py-6 cursor-pointer transition-all duration-300 ${activeTab === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                                onClick={() => setActiveTab(index)}
                            >
                                {activeTab === index && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full shadow-[0_0_15px_#9f20ff]"
                                    />
                                )}
                                <h3 className={`text-xl font-heading font-bold mb-3 ${activeTab === index ? 'text-white' : 'text-gray-300'}`}>
                                    {feature.heading}
                                </h3>
                                <p className="text-base font-sans leading-relaxed text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Image/Dashboard Mockup */}
                <div className="w-full md:w-7/12 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(159,32,255,0.1)]">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={activeTab}
                            src={features[activeTab].image}
                            alt={features[activeTab].heading}
                            className="absolute inset-0 w-full h-full object-cover object-left-top transition-transform duration-700 group-hover:scale-105"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-[#0f0418] text-gray-400 font-sans hidden">
                            <span className="font-bold text-white tracking-widest uppercase text-xs border border-white/20 px-3 py-1 rounded-full">Missing Asset</span>
                            Please add '{features[activeTab].image.replace('/', '')}' to the public folder.
                        </div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

const LuminescenceVerificationScanner = () => {
    const [scanComplete, setScanComplete] = useState(false);

    useEffect(() => {
        const sequence = setInterval(() => {
            setScanComplete(false);
            setTimeout(() => setScanComplete(true), 2000); // Scan takes 2s
        }, 4000); // Full loop every 4s
        return () => clearInterval(sequence);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-black/40 rounded-xl relative overflow-hidden group">
            {/* The Scanner Frame (Ticket Stub) */}
            <motion.div
                className={`relative w-24 h-24 border-dashed border-2 bg-white/5 backdrop-blur-[4px] flex items-center justify-center overflow-hidden transition-colors duration-300 z-0 ${scanComplete ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-[#4a4a4a]'}`}
            >
                {/* The Scanning Beam */}
                {!scanComplete && (
                    <motion.div
                        className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-accent/20 via-accent to-white z-[100]"
                        style={{ boxShadow: "0 0 15px 2px #9f20ff" }}
                        initial={{ top: 0 }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, ease: "linear" }}
                    />
                )}

                {/* Subdued Grid Background */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTE5LjUgMEwxOS41IDIwSDIwVjBIMTkuNVpNMCAxOS41SDIwVjIwSDBWMTkuNVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]" />

                {/* Success Orb */}
                <AnimatePresence>
                    {scanComplete && (
                        <motion.div
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.34, 1.56, 0.64, 1] // Custom spring bounce
                            }}
                            className="relative z-20 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-white stroke-[3] fill-none" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const VelocitySettlementBar = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    useEffect(() => {
        const loop = setInterval(() => {
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        }, 5000); // Full loop every 5s
        return () => clearInterval(loop);
    }, []);

    return (
        <div className="w-full h-full flex flex-col justify-center px-6 bg-black/40 rounded-xl relative overflow-hidden group">
            {/* The Track and Bar */}
            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`absolute top-0 left-0 h-full rounded-full ${isSuccess ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-gradient-to-r from-accent/20 via-accent to-white shadow-[0_0_15px_#9f20ff]'}`}
                    animate={{ width: isSuccess ? "100%" : ["0%", "100%"] }}
                    transition={{
                        duration: isSuccess ? 0.2 : 3,
                        ease: "easeIn"
                    }}
                />
            </div>

            {/* Floating Toast Notification */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/50 backdrop-blur-md whitespace-nowrap"
                        initial={{ opacity: 0, y: 10, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -10, x: "-50%" }}
                        transition={{ duration: 0.4 }}
                    >
                        +$42,500 Disbursed
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ResonanceWaveform = () => {
    const [isStable, setIsStable] = useState(false);

    // SVG paths for the waveform morphing
    const wildWave = "M 0 50 Q 10 20 20 50 T 40 50 T 60 50 T 80 50 T 100 50";
    const wildWaveAlt = "M 0 50 Q 10 80 20 50 T 40 50 T 60 50 T 80 50 T 100 50";
    const stableWave = "M 0 50 Q 12.5 35 25 50 T 50 50 T 75 50 T 100 50";

    useEffect(() => {
        const loop = setInterval(() => {
            setIsStable(true);
            setTimeout(() => setIsStable(false), 2500); // Remain stable for 2.5s
        }, 5000);
        return () => clearInterval(loop);
    }, []);

    return (
        <div className="w-full h-full flex flex-col justify-between px-6 py-6 bg-black/40 rounded-xl relative overflow-hidden group">
            {/* Availability Orbit & Headset */}
            <div className="flex justify-between items-start w-full">
                <div className="relative w-12 h-12 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-md border border-white/10">
                    <Headset className="text-accent w-5 h-5 z-10" />
                    {/* Rotating Orbit Ring */}
                    <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_4s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_#9f20ff]" />
                        <div className="absolute bottom-[15%] left-[10%] w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_#9f20ff]" />
                        <div className="absolute bottom-[15%] right-[10%] w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_#9f20ff]" />
                    </div>
                </div>

                {/* Specialist Node Ping */}
                <AnimatePresence>
                    {isStable && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-accent/20 border border-accent/50 text-accent text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(159,32,255,0.4)]"
                        >
                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                            Specialist Connected
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Morphing Waveform */}
            <div className="w-full h-16 mt-4 relative flex items-center">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-accent/70 fill-none stroke-[2] drop-shadow-[0_0_8px_rgba(159,32,255,0.6)]">
                    <motion.path
                        animate={{
                            d: isStable ? stableWave : [wildWave, wildWaveAlt, wildWave],
                        }}
                        transition={{
                            duration: isStable ? 0.8 : 0.4,
                            repeat: isStable ? 0 : Infinity,
                            ease: "easeInOut"
                        }}
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    );
};

const CipherShieldMatrix = () => {
    const [activePacket, setActivePacket] = useState(0);
    const [protocolIndex, setProtocolIndex] = useState(0);

    const protocols = ["AES-256", "SSL-ACTIVE", "ISO-27001", "SOC2-TYPEII"];
    const packets = [0, 1, 2, 3];

    useEffect(() => {
        const loop = setInterval(() => {
            setActivePacket((prev) => (prev + 1) % packets.length);
        }, 800);
        return () => clearInterval(loop);
    }, [packets.length]);

    useEffect(() => {
        const loop = setInterval(() => {
            setProtocolIndex((prev) => (prev + 1) % protocols.length);
        }, 2000);
        return () => clearInterval(loop);
    }, [protocols.length]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black/40 rounded-xl relative overflow-hidden group">
            {/* Hexagonal Grid Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PHBhdGggZD0nTTIwIDBMMzcuMzIgMTBWMzBMMjAgNDBMMi42OCAzMFYxMHonIGZpbGw9J25vbmUnIHN0cm9rZT0nI2ZmZicgc3Ryb2tlLXdpZHRoPScxJy8+PC9zdmc+')] animate-[pulse_4s_ease-in-out_infinite]" />

            {/* Shield and Packets */}
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
                <div className="absolute inset-0 flex justify-between px-2">
                    {packets.map((packet) => (
                        <motion.div
                            key={packet}
                            className={`w-2 h-2 rounded-sm ${packet === activePacket ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gray-600'}`}
                            animate={{
                                y: packet === activePacket ? [0, 40] : 0,
                                scale: packet === activePacket ? [1, 1.5, 0] : 1,
                                opacity: packet === activePacket ? [1, 1, 0] : 0.5
                            }}
                            transition={{ duration: 0.8 }}
                        />
                    ))}
                </div>

                <div className="relative z-10 bg-[#0a0510] border-2 border-accent rounded-xl p-3 shadow-[0_0_20px_rgba(159,32,255,0.4)]">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-accent fill-none stroke-[2]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
            </div>

            {/* Protocol Readout */}
            <div className="absolute top-4 right-4 text-right">
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Status</span>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={protocolIndex}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-emerald-400 font-mono text-[10px] tracking-widest"
                    >
                        {protocols[protocolIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
};

const AdditionalFeaturesGrid = () => {
    const features = [
        {
            title: "End-to-End Event Management",
            description: "Manage and promote events seamlessly, covering everything from ticketing to attendee check-in.",
            component: <LuminescenceVerificationScanner />
        },
        {
            title: "Instant Payouts",
            description: "Get paid within 24 hours with automated settlements and transparent fee structures.",
            component: <VelocitySettlementBar />
        },
        {
            title: "24/7 Expert Support",
            description: "Dedicated music industry specialists available around the clock to ensure event success.",
            component: <ResonanceWaveform />
        },
        {
            title: "Enterprise Security",
            description: "Bank-level encryption, fraud protection, and compliance with industry standards.",
            component: <CipherShieldMatrix />
        }
    ];

    return (
        <section className="py-24 px-6 max-w-7xl mx-auto w-full relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
                    And Much More
                </h2>
                <button className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(159,32,255,0.3)]">
                    Sign Up for free
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-[#0a0510] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 hover:border-accent/40 transition-colors group"
                    >
                        <div className="w-full aspect-video bg-black/20 rounded-xl shadow-inner overflow-hidden relative">
                            {feature.component}
                        </div>

                        <div className="flex flex-col gap-3">
                            <h3 className="text-lg font-bold text-white leading-snug">
                                {feature.title}
                            </h3>
                            <p className="text-sm font-sans text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const AgitationTicker = () => {
    const text = "Logistics shouldn't be a nightmare. Say goodbye to manual guest lists and fragmented spreadsheets. • ";
    return (
        <div className="w-full bg-accent/10 border-y border-accent/20 py-5 overflow-hidden flex whitespace-nowrap mt-20">
            <motion.div
                className="flex text-accent font-heading font-medium text-xl md:text-2xl uppercase tracking-widest"
                animate={{ x: [0, -1500] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            >
                <span>{text.repeat(10)}</span>
            </motion.div>
        </div>
    );
};

const ProductShowcase = () => (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight">
                Total Control. <br />
                <span className="text-gray-500">Any Event.</span>
            </h2>
            <p className="text-xl text-gray-400 font-sans leading-relaxed max-w-lg">
                Whether it's a pottery class or a warehouse rave, Prizmatix centralizes your operation. Track revenue in real-time and manage capacity effortlessly.
            </p>
            <div className="flex gap-4">
                <div className="w-12 h-1 bg-accent rounded-full" />
                <div className="w-12 h-1 bg-white/20 rounded-full" />
                <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
        </div>
        <div className="flex-1 relative w-full flex justify-center [perspective:1000px]">
            <motion.div
                whileHover={{ rotateY: -10, rotateX: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative w-72 h-[600px] bg-[#111] rounded-[3rem] border-8 border-[#222] shadow-2xl shadow-accent/20 overflow-hidden shrink-0"
            >
                <div className="absolute top-0 inset-x-0 h-6 bg-[#222] rounded-b-3xl mx-auto w-1/2" />
                <div className="p-6 pt-12 text-white h-full flex flex-col">
                    <div className="mb-8">
                        <h4 className="text-sm text-gray-400 font-medium">Total Revenue</h4>
                        <div className="text-3xl font-heading font-bold mt-1 text-accent">$24,500<span className="text-sm text-gray-500">.00</span></div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-accent/20 to-transparent rounded-2xl border border-white/10 flex items-end p-4">
                        <BarChart3 className="text-accent w-full h-1/2 opacity-80" strokeWidth={1.5} />
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="h-12 bg-white/5 rounded-xl flex items-center px-4 gap-3"><Users size={18} className="text-gray-400" /> <div className="h-2 w-24 bg-white/20 rounded-full" /></div>
                        <div className="h-12 bg-white/5 rounded-xl flex items-center px-4 gap-3"><Ticket size={18} className="text-gray-400" /> <div className="h-2 w-20 bg-white/20 rounded-full" /></div>
                    </div>
                </div>
            </motion.div>
            <div className="absolute inset-0 bg-accent/20 blur-[100px] -z-10 rounded-full scale-50" />
        </div>
    </section>
);

const BentoGrid = () => {
    const features = [
        { title: "Real-Time Intelligence", desc: "Views, conversions, and demographics live.", icon: <BarChart3 size={24} />, colSpan: "md:col-span-2", bg: "bg-white/5" },
        { title: "Instant Liquidity", desc: "Advance payouts before sales end. Transparent fees.", icon: <Expand size={24} />, colSpan: "md:col-span-1", bg: "bg-accent/20" },
        { title: "Seamless Entry", desc: "QR scanning that works offline—essential for any venue.", icon: <ShieldCheck size={24} />, colSpan: "md:col-span-1", bg: "bg-white/5" },
        { title: "Built-In Growth", desc: "Email campaigns and promo codes natively integrated.", icon: <Mail size={24} />, colSpan: "md:col-span-2", bg: "bg-white/5" },
    ];

    return (
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className={`p-8 rounded-3xl border border-white/10 ${f.bg} ${f.colSpan} flex flex-col justify-between group overflow-hidden relative`}
                    >
                        <div className="mb-12 text-accent bg-background w-12 h-12 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            {f.icon}
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-heading font-bold text-white mb-3">{f.title}</h3>
                            <p className="text-gray-300 font-sans">{f.desc}</p>
                        </div>
                        {f.bg.includes('accent') && <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent blur-[80px] opacity-30" />}
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const ParallaxShowcase = () => {
    const { scrollYProgress } = useScroll();

    // Parallax values based on overall scroll progress or offset. 
    // Mapped broadly so they move subtly throughout the scroll range.
    const phoneY = useTransform(scrollYProgress, [0, 1], [50, -100]);
    const foregroundY = useTransform(scrollYProgress, [0, 1], [150, -250]);
    const midgroundY = useTransform(scrollYProgress, [0, 1], [50, -150]);
    const backgroundY = useTransform(scrollYProgress, [0, 1], [-50, 100]);

    // Infinite float animation for the collage items
    const floatAnimation = {
        y: [0, -15, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    const collageImages = [
        // Column 1 (Far Left)
        { id: 1, src: "/collage-1.jpg", alt: "DJ Mixing", css: { width: "260px", height: "260px", marginLeft: "-580px", marginTop: "-150px" }, parallax: backgroundY, delay: 0 },
        { id: 2, src: "/collage-2.jpg", alt: "Concert Stage", css: { width: "260px", height: "300px", marginLeft: "-580px", marginTop: "150px" }, parallax: backgroundY, delay: 1 },
        // Column 2 (Inner Left)
        { id: 3, src: "/collage-3.jpg", alt: "Pink Crowd", css: { width: "220px", height: "280px", marginLeft: "-300px", marginTop: "-280px" }, parallax: foregroundY, delay: 0.5 },
        { id: 4, src: "/collage-4.jpg", alt: "Yellow Fog", css: { width: "220px", height: "280px", marginLeft: "-300px", marginTop: "30px" }, parallax: foregroundY, delay: 1.5 },
        // Column 3 (Inner Right)
        { id: 5, src: "/collage-5.jpg", alt: "Guy Drawing", css: { width: "200px", height: "200px", marginLeft: "100px", marginTop: "-350px" }, parallax: foregroundY, delay: 0.2 },
        { id: 6, src: "/collage-6.jpg", alt: "Studio Desk", css: { width: "200px", height: "280px", marginLeft: "100px", marginTop: "-100px" }, parallax: foregroundY, delay: 1.2 },
        // Column 4 (Far Right)
        { id: 7, src: "/collage-7.jpg", alt: "Singer", css: { width: "280px", height: "280px", marginLeft: "320px", marginTop: "-180px" }, parallax: midgroundY, delay: 0.8 },
        { id: 8, src: "/collage-8.jpg", alt: "Laptop Guy", css: { width: "280px", height: "280px", marginLeft: "320px", marginTop: "160px" }, parallax: backgroundY, delay: 1.8 },
    ];

    return (
        <section className="relative w-full min-h-[1000px] bg-[#0a0a0a] overflow-hidden py-32 flex flex-col items-center">
            {/* Text Block */}
            <div className="relative z-30 text-center px-6 max-w-3xl mb-32">
                <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight">
                    Craft Moments, <br />
                    <span className="text-gray-500">Not Just Tickets.</span>
                </h2>
                <p className="text-xl text-gray-400 font-sans leading-relaxed">
                    From the first click to the final encore, deliver a seamless, premium experience that matches your brand's energy.
                </p>
            </div>

            {/* Animation Block & Collage */}
            <div className="relative w-full max-w-7xl h-[700px] flex justify-center items-center">

                {/* Collage Array */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {collageImages.map((img) => (
                        <motion.div
                            key={img.id}
                            style={{
                                y: img.parallax,
                                width: img.css.width,
                                height: img.css.height,
                                marginLeft: img.css.marginLeft,
                                marginTop: img.css.marginTop
                            }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto hidden md:block"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -15, 0],
                                    transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: img.delay }
                                }}
                                className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl opacity-50 hover:opacity-100 transition-opacity duration-300 border border-white/10 bg-white/5 relative group"
                            >
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 hidden"
                                    onLoad={(e) => {
                                        e.target.style.display = 'block';
                                        e.target.nextSibling.style.display = 'none';
                                    }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 text-sm font-medium p-4 text-center">
                                    <span className="mb-2 text-white/50">{img.alt}</span>
                                    <span className="text-[10px] break-all group-hover:block hidden">{img.src}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Central Anchor: The Phone Mockup Image */}
                <motion.div
                    style={{ y: phoneY }}
                    className="relative z-20 w-[280px] md:w-[320px] shrink-0 drop-shadow-[0_0_80px_rgba(159,32,255,0.3)] transition-transform hover:scale-105 duration-500"
                >
                    <img
                        src="/phone-mockup.png"
                        alt="My Ticket Interface"
                        className="w-full h-auto hidden"
                        onLoad={(e) => {
                            e.target.style.display = 'block';
                            e.target.nextSibling.style.display = 'none';
                        }}
                    />
                    <div className="flex w-full h-[650px] bg-white/5 border border-white/10 rounded-[3rem] items-center justify-center text-white/50 flex-col backdrop-blur-md">
                        <p className="font-heading font-bold text-white mb-2">Phone Placeholder</p>
                        <p className="text-xs text-center px-6">Save your mockup image as:<br /><strong className="text-accent underline">/public/phone-mockup.png</strong></p>
                    </div>
                </motion.div>

                {/* Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 blur-[150px] rounded-full pointer-events-none z-0" />
            </div>
        </section>
    );
};

const FAQSection = () => {
    const faqs = [
        {
            q: "What is Prizmatix?",
            a: "Prizmatix is a platform that helps event organizers create, manage, and promote their events, while seamlessly handling ticket sales, check-ins, and analytics."
        },
        {
            q: "How do I create an event on Prizmatix?",
            a: "It’s seamless. You can create an event page in minutes by entering basic details, uploading your media, and setting ticket tiers. The platform allows you to fully customize your page with your branding—no coding required."
        },
        {
            q: "Does Prizmatix support recurring events or multi-day festivals?",
            a: "Yes. Prizmatix is built with festivals and complex event schedules in mind. Whether it's a multi-day music festival or a recurring weekly workshop, our system handles single-day passes, full-weekend bundles, and recurring dates effortlessly."
        },
        {
            q: "How do ticket payouts work?",
            a: "We prioritize your cash flow. Unlike platforms that hold funds until after the event, Prizmatix offers fast payouts within 24 hours. We also offer an 'Advance Payout' option so you can access funds before sales end to cover upfront costs."
        },
        {
            q: "What fees does Prizmatix charge?",
            a: "We believe in total transparency. There are no setup fees and no long-term contracts. We charge a minimal, transparent commission per ticket sold, ensuring you keep the maximum amount of your revenue."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                    Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-400 font-sans">
                    Everything you need to know about running your events on Prizmatix.
                </p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-white/5 transition-colors"
                            >
                                <span className="font-heading font-semibold text-lg text-white">{faq.q}</span>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                    <ChevronDown size={20} className="text-accent" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-5 text-gray-400 font-sans leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const TrustSection = () => (
    <section className="py-32 px-6 text-center border-t border-white/5 bg-gradient-to-b from-transparent to-[#0f0418]">
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                World-Class Tech. <span className="text-accent">Kiwi Roots.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 font-sans leading-relaxed">
                Prizmatix is built in New Zealand. 24/7 support from a team that understands the local market and your specific needs.
            </p>
        </div>
    </section>
);

const Footer = () => (
    <footer className="py-24 px-6 md:px-12 border-t border-white/10 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight">
                Ready to Amplify <br /> Your Experience?
            </h2>
            <Link to="/register" className="group relative overflow-hidden bg-white text-black px-10 py-5 rounded-full font-bold text-lg flex items-center gap-3 transition-transform">
                <span className="relative z-10 flex items-center gap-3">
                    Start Organizing Free <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
                </span>
                <div className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-700 ease-out z-0" />
            </Link>
            <div className="w-full flex flex-col md:flex-row justify-between items-center pt-20 border-t border-white/10 text-gray-500 text-sm gap-4">
                <div>© 2026 Prizmatix. All rights reserved.</div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <Link to="/login" className="hidden md:block text-gray-300 hover:text-white transition-colors">Login</Link>
                    <Link to="/register" className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-colors">
                        Get Started
                    </Link>
                </div>
            </div>
        </div>
    </footer>
);

const NoiseOverlay = () => (
    <div
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
    />
);

function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        })

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    return (
        <div className="bg-background min-h-screen text-white selection:bg-accent selection:text-white">
            <AnimatePresence>
                {loading && <Preloader onComplete={() => setLoading(false)} />}
            </AnimatePresence>

            <NoiseOverlay />

            {!loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    <Navbar />
                    <Hero />
                    <ParallaxGrittyTypography />
                    <TabbedFeatures />
                    <AdditionalFeaturesGrid />
                    <AgitationTicker />
                    <ProductShowcase />
                    <ParallaxShowcase />
                    {/* <BentoGrid /> */}
                    <FAQSection />
                    <TrustSection />
                    <Footer />
                </motion.div>
            )}
        </div>
    );
}

export default App;
