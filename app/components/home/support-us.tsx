"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  UserPlus, 
  Star, 
  MessageCircle, 
  MessageSquare, 
  Check, 
  Sparkles, 
  MoreHorizontal, 
  Send,
  type LucideIcon
} from "lucide-react";

// Types
type ActiveTab = "like" | "follow" | "review" | "comment";

interface TabConfig {
  id: ActiveTab;
  label: string;
  flyerLabel: string;
  description: string;
  icon: LucideIcon;
}

// Tabs configuration
const tabs: TabConfig[] = [
  {
    id: "like",
    label: "Like our posts",
    flyerLabel: "Like our posts",
    description: "Double tap to show love on our new releases and process videos. Every like helps the algorithm share our work with other clay lovers.",
    icon: Heart,
  },
  {
    id: "follow",
    label: "Follow them on social media",
    flyerLabel: "Follow our updates",
    description: "Stay updated on our daily studio rituals, workshop announcements, and behind-the-scenes clay prep.",
    icon: UserPlus,
  },
  {
    id: "review",
    label: "Leave a positive review",
    flyerLabel: "Review our workshop & pieces",
    description: "Reviews help local pottery enthusiasts discover us. If you own a Haritham piece or attended a class, your feedback is our biggest reward.",
    icon: Star,
  },
  {
    id: "comment",
    label: "Comment on something nice",
    flyerLabel: "Comment on something nice",
    description: "A kind word goes a long way. Share your thoughts on our process, ask questions about glazes, or just say hello in the comments!",
    icon: MessageCircle,
  },
];

export default function SupportUsSection() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("like");
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Autoplay functionality: cycle tabs every 6 seconds unless user is hovering/interacting
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const currentIndex = tabs.findIndex((t) => t.id === prev);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#fffcf9] py-24 text-[#1b1511] md:py-32"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Blueprint/Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e8dfd2" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Subtle organic light accent gradients */}
      <div className="absolute -left-64 top-1/4 h-[500px] w-[500px] rounded-full bg-[#fdf2eb] opacity-70 blur-[120px] pointer-events-none" />
      <div className="absolute -right-64 bottom-1/4 h-[500px] w-[500px] rounded-full bg-[#edf1e7] opacity-60 blur-[120px] pointer-events-none" />

      <div className="site-container relative z-10">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]"
          >
            Support Local Craft
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 text-4xl font-display uppercase leading-tight tracking-normal text-[#1b1511] sm:text-5xl md:text-6xl"
          >
            How to Support <br />
            <span className="text-[#9a6b4e] font-serif lowercase italic tracking-wide">small businesses</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#6b5f55]"
          >
            It costs nothing to support a local maker. Explore four simple ways you can help us keep the pottery wheel spinning and share our craft.
          </motion.p>
        </div>

        {/* Desktop Interactive Layout (Side by Side) / Mobile Stacked */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          
          {/* Mockup Preview Panel (Left Side on Desktop) */}
          <div className="relative flex justify-center order-2 lg:order-1 min-h-[460px] md:min-h-[500px] items-center">
            
            {/* Hand-drawn SVG Connectors (Arrows matching flyer style) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
              viewBox="0 0 600 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Like arrow - pointing to the heart icon */}
              <AnimatePresence>
                {activeTab === "like" && (
                  <motion.path 
                    d="M 520 220 C 450 160, 360 140, 290 170"
                    stroke="#ff7878"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    markerEnd="url(#arrow-red)"
                  />
                )}
              </AnimatePresence>

              {/* Follow arrow - pointing to Instagram profile */}
              <AnimatePresence>
                {activeTab === "follow" && (
                  <motion.path 
                    d="M 520 250 C 420 240, 320 240, 220 270"
                    stroke="#9d916a"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Review arrow - pointing down towards star review */}
              <AnimatePresence>
                {activeTab === "review" && (
                  <motion.path 
                    d="M 520 280 C 480 340, 420 380, 330 380"
                    stroke="#d4af37"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Comment arrow - pointing up towards comment bubble */}
              <AnimatePresence>
                {activeTab === "comment" && (
                  <motion.path 
                    d="M 520 310 C 460 360, 340 380, 240 340"
                    stroke="#50b3e6"
                    strokeWidth="2.5"
                    strokeDasharray="6,6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>
            </svg>

            {/* Display Active Mockup */}
            <div className="w-full max-w-[430px] rounded-[36px] bg-white p-4 shadow-[0_24px_50px_rgba(27,21,17,0.06)] border border-[#e8dfd2]/80 relative overflow-hidden backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {activeTab === "like" && <LikeMockup key="like-mock" />}
                {activeTab === "follow" && <FollowMockup key="follow-mock" />}
                {activeTab === "review" && <ReviewMockup key="review-mock" />}
                {activeTab === "comment" && <CommentMockup key="comment-mock" />}
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Information & Pill Selector (Right Side on Desktop) */}
          <div className="flex flex-col gap-8 order-1 lg:order-2">
            
            {/* The Capsule Tab Selector (flyer-style floating capsule) */}
            <div className="relative rounded-full border border-[#f3e6db] bg-[#fff8f3] p-2.5 shadow-[0_12px_30px_rgba(154,107,78,0.06)] flex items-center justify-between gap-1 w-full max-w-[480px] mx-auto lg:mx-0">
              
              {/* Highlight background pill animation */}
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center justify-center p-4 rounded-full transition-colors flex-1"
                    aria-label={tab.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-full shadow-[0_4px_16px_rgba(27,21,17,0.08)] bg-white border border-[#ebdccf]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <IconComponent 
                      className={`relative z-10 h-6 w-6 transition-transform duration-300 ${
                        isActive 
                          ? tab.id === "like" ? "text-red-500 scale-110 fill-red-500" 
                            : tab.id === "follow" ? "text-[#8a7765] scale-110 fill-[#8a7765]/20"
                            : tab.id === "review" ? "text-yellow-500 scale-110 fill-yellow-500"
                            : "text-[#50b3e6] scale-110 fill-[#50b3e6]/20"
                          : "text-[#8a7765]/60 hover:text-[#1b1511] hover:scale-105"
                      }`} 
                    />
                  </button>
                );
              })}
            </div>

            {/* Instruction Details */}
            <div className="min-h-[180px] text-center lg:text-left flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {tabs.map((tab) => {
                  if (tab.id !== activeTab) return null;
                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f6eee5] text-[10px] uppercase font-bold tracking-[0.2em] text-[#9a6b4e] border border-[#ebdccf]/50">
                        <Sparkles className="h-3 w-3" />
                        Action 0{tabs.findIndex(t => t.id === tab.id) + 1}
                      </div>
                      
                      <h3 className="text-3xl font-display text-[#1b1511]">
                        {tab.label}
                      </h3>
                      
                      <p className="text-[#6b5f55] text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                        {tab.description}
                      </p>
                      
                      {/* Social/Call to Action Link */}
                      <div className="pt-2">
                        {tab.id === "like" || tab.id === "follow" || tab.id === "comment" ? (
                          <a 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6b4e] hover:text-[#1b1511] underline underline-offset-4 decoration-[#ebdccf] hover:decoration-[#1b1511] transition-colors"
                          >
                            Visit our Instagram @studio.haritham
                          </a>
                        ) : (
                          <a 
                            href="#testimonials" 
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6b4e] hover:text-[#1b1511] underline underline-offset-4 decoration-[#ebdccf] hover:decoration-[#1b1511] transition-colors"
                          >
                            See what collectors are saying below
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
          </div>
          
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Mockup 1: Like Posts (Double tap card + floaty hearts)
   ========================================================================== */
function LikeMockup() {
  const [likes, setLikes] = useState(148);
  const [hasLiked, setHasLiked] = useState(false);
  const [heartClicks, setHeartClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Floating hearts generator
  const triggerLike = useCallback((e?: React.MouseEvent) => {
    setHasLiked((prevHasLiked) => {
      if (!prevHasLiked) {
        setLikes((prev) => prev + 1);
      }
      return true;
    });
    
    // Calculate click coordinates or random offset
    let clickX = 150;
    let clickY = 150;
    
    if (e && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    } else {
      clickX = 140 + Math.random() * 60;
      clickY = 130 + Math.random() * 50;
    }
    
    const newHeart = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
    };
    
    setHeartClicks((prev) => [...prev, newHeart]);
    
    // Remove heart after animation complete
    setTimeout(() => {
      setHeartClicks((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  }, []);

  // Autoplay pulse like action
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerLike();
    }, 1500);
    return () => clearTimeout(timer);
  }, [triggerLike]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col bg-white"
    >
      {/* Social Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f3e6db]/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#fdf2eb] border border-[#ebdccf] flex items-center justify-center font-bold text-xs text-[#9a6b4e]">
            SH
          </div>
          <div>
            <div className="text-xs font-bold text-[#1b1511] flex items-center gap-1.5">
              studio.haritham
              <span className="h-1.5 w-1.5 rounded-full bg-[#9a6b4e] block" />
            </div>
            <div className="text-[10px] text-[#8a7765]">Handmade Ceramics</div>
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-[#8a7765]/80" />
      </div>

      {/* Image Post Area (with double tap trigger) */}
      <div 
        ref={imageContainerRef}
        onDoubleClick={triggerLike}
        className="relative mt-3 aspect-square w-full overflow-hidden rounded-2xl bg-[#f7f6ef] cursor-pointer group shadow-inner"
      >
        <Image 
          src="/images/mug-a.avif" 
          alt="Clay mug" 
          fill 
          sizes="(max-width: 430px) 100vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Floating Heart Particles */}
        <AnimatePresence>
          {heartClicks.map((heart) => (
            <motion.div
              key={heart.id}
              className="absolute pointer-events-none z-30"
              style={{ left: heart.x - 20, top: heart.y - 20 }}
              initial={{ opacity: 1, scale: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0.8, 0], 
                scale: [0, 1.5, 1.2, 0.8], 
                y: -120,
                x: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 80]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <Heart className="h-10 w-10 text-red-500 fill-red-500 drop-shadow-[0_4px_8px_rgba(239,68,68,0.4)]" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Double-tap large centered heart overlay */}
        <AnimatePresence>
          {heartClicks.length > 0 && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.2, 0.95, 1], opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-full p-6 border border-white/20">
                <Heart className="h-16 w-16 text-white fill-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.2)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Social Actions Panel */}
      <div className="flex items-center gap-4 py-3 text-[#1b1511]">
        <button onClick={triggerLike} className="focus:outline-none transition-transform active:scale-90">
          <Heart className={`h-6 w-6 transition-colors duration-200 ${hasLiked ? "text-red-500 fill-red-500" : "hover:text-red-500"}`} />
        </button>
        <MessageCircle className="h-6 w-6 hover:text-blue-500 cursor-pointer" />
        <Send className="h-5 w-5 hover:text-green-600 cursor-pointer" />
      </div>

      {/* Caption & Likes stats */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-[#1b1511]">{likes} likes</div>
        <p className="text-xs text-[#6b5f55] leading-relaxed">
          <span className="font-bold text-[#1b1511] mr-1">studio.haritham</span>
          Sculpted in our home studio, capturing the raw textures of natural clay. Fresh glaze batches out tomorrow! ✨☕️
        </p>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   Mockup 2: Follow (Instagram Profile Follow animation & QR Code)
   ========================================================================== */
function FollowMockup() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsFollowing(true);
    }, 1000);
  };

  // Autoplay follow action
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsFollowing(true);
      }, 800);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col bg-white gap-6"
    >
      {/* Profile Info Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-[#9d916a] via-[#e8dfd2] to-[#9a6b4e] shadow-sm">
            <div className="h-full w-full rounded-full bg-white p-[2px]">
              <div className="h-full w-full rounded-full bg-[#fcfdfa] border border-[#ebdccf] flex items-center justify-center font-serif text-lg font-bold text-[#9d916a]">
                H
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-sm text-[#1b1511]">studio.haritham</h4>
            <p className="text-[11px] text-[#8a7765]">Pottery, Art & Classes</p>
            <div className="mt-2 flex gap-4 text-[11px] text-[#6b5f55]">
              <div><strong className="text-[#1b1511]">82</strong> posts</div>
              <div><strong className="text-[#1b1511]">4.8k</strong> followers</div>
            </div>
          </div>
        </div>

        {/* Follow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFollowToggle}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 ${
              isFollowing 
                ? "bg-[#edf1e7] text-[#5c6e4e] border border-[#c9d6be]" 
                : "bg-[#1b1511] text-white hover:bg-[#3a2f26]"
            }`}
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isFollowing ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                Follow
              </>
            )}
          </button>
          
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[#e8dfd2] rounded-xl hover:bg-[#fcfdfa] text-[#8a7765] transition-colors"
          >
            <Send className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* QR Code Layout from the flyer */}
      <div className="border-t border-[#f3e6db]/60 pt-4 flex flex-col items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a7765] mb-3">
          Scan QR Code on Flyer
        </p>
        
        <div className="relative group cursor-pointer p-4 bg-[#fdfaf7] border border-[#f3e6db] rounded-2xl flex flex-col items-center shadow-sm">
          
          {/* Simulated QR Code box */}
          <div className="relative w-36 h-36 bg-white p-2.5 rounded-xl border border-[#ebdccf]/60 shadow-inner flex items-center justify-center overflow-hidden">
            
            {/* Custom SVG QR Code Representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#1b1511]" fill="currentColor">
              {/* Outer corners */}
              <rect x="0" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="5" y="5" width="15" height="15" />
              
              <rect x="75" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="80" y="5" width="15" height="15" />
              
              <rect x="0" y="75" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="5" y="80" width="15" height="15" />

              {/* Grid noise inside simulating Instagram custom tags/QR codes */}
              <path d="M 35 10 h 10 v 10 h -10 Z M 55 5 h 10 v 10 h -10 Z M 35 30 h 10 v 10 h -10 Z M 45 45 h 10 v 10 h -10 Z M 65 35 h 10 v 10 h -10 Z M 55 60 h 10 v 10 h -10 Z M 70 70 h 10 v 10 h -10 Z M 80 50 h 10 v 10 h -10 Z M 30 75 h 10 v 10 h -10 Z M 45 85 h 10 v 10 h -10 Z M 60 75 h 10 v 10 h -10 Z M 85 85 h 10 v 10 h -10 Z" />
              
              {/* Instagram rounded badge inside QR */}
              <circle cx="50" cy="50" r="16" fill="white" />
              <circle cx="50" cy="50" r="12" fill="none" stroke="#9a6b4e" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="4" fill="#9a6b4e" />
              <circle cx="57" cy="43" r="1.5" fill="#9a6b4e" />
            </svg>

            {/* Glowing Scan target line */}
            <motion.div 
              className="absolute left-0 right-0 h-0.5 bg-red-400 opacity-60 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="mt-2 text-[9px] uppercase tracking-widest text-[#9a6b4e] font-bold flex items-center gap-1">
            <span className="animate-pulse">●</span> SCAN ME TO FOLLOW
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   Mockup 3: Leave a Review (Google-style Review animation)
   ========================================================================== */
function ReviewMockup() {
  const [stars, setStars] = useState(0);
  const testimonial = "Absolutely love the ceramic mugs from Studio Haritham. They feel so earthy and hold heat beautifully! The pottery class was pure magic.";
  const [textShown, setTextShown] = useState("");

  useEffect(() => {
    // Stage 1: Stars lighting up one by one
    const starInterval = setInterval(() => {
      setStars((prev) => {
        if (prev >= 5) {
          clearInterval(starInterval);
          return 5;
        }
        return prev + 1;
      });
    }, 280);

    // Stage 2: Text typing animation
    let textIndex = 0;
    let typingTimer: NodeJS.Timeout;
    
    const startTyping = () => {
      typingTimer = setInterval(() => {
        if (textIndex < testimonial.length) {
          setTextShown(testimonial.slice(0, textIndex + 1));
          textIndex++;
        } else {
          clearInterval(typingTimer);
        }
      }, 25);
    };

    const delayTyping = setTimeout(startTyping, 1400);

    return () => {
      clearInterval(starInterval);
      clearInterval(typingTimer);
      clearTimeout(delayTyping);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col bg-white text-left"
    >
      {/* Review Header */}
      <div className="flex items-center gap-3 border-b border-[#f3e6db]/60 pb-4">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#ebdccf]">
          <span className="h-full w-full flex items-center justify-center font-bold text-xs text-[#9a6b4e] uppercase">
            AR
          </span>
        </div>
        <div>
          <div className="text-xs font-bold text-[#1b1511]">Ananya Roy</div>
          <div className="text-[10px] text-[#8a7765]">Local Guide • 14 reviews</div>
        </div>
        
        {/* Google verification badge mockup */}
        <div className="ml-auto text-[10px] font-semibold text-[#5c6e4e] bg-[#edf1e7] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#c9d6be]">
          <Check className="h-3 w-3" /> Verified Customer
        </div>
      </div>

      {/* Review Star Rating */}
      <div className="mt-4 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= stars;
          return (
            <motion.div
              key={index}
              animate={isFilled ? { scale: [1, 1.25, 1], rotate: [0, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Star 
                className={`h-5 w-5 ${
                  isFilled 
                    ? "text-[#d4af37] fill-[#d4af37]" 
                    : "text-neutral-200 fill-neutral-100"
                }`} 
              />
            </motion.div>
          );
        })}
        <span className="ml-2 text-xs font-bold text-[#1b1511]">
          {stars}.0
        </span>
      </div>

      {/* Testimonial body */}
      <div className="mt-3 bg-[#fffaf5] border border-[#f3e6db]/50 p-4 rounded-2xl min-h-[110px] flex items-center">
        <p className="text-xs md:text-sm text-[#6b5f55] leading-relaxed italic font-sans">
          &ldquo;{textShown}&rdquo;
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#9a6b4e] animate-pulse" />
        </p>
      </div>

      {/* Studio response mockup */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.8, duration: 0.5 }}
        className="mt-4 border-l-2 border-[#ebdccf] pl-3 py-1 ml-2"
      >
        <div className="text-[10px] font-bold text-[#9a6b4e]">
          Response from Studio Haritham:
        </div>
        <p className="text-[10px] text-[#8a7765] mt-1 italic">
          Thank you so much, Ananya! Clay brings us so much peace, and we&apos;re thrilled that it translates to your daily rituals with our mugs. 🤎
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ==========================================================================
   Mockup 4: Comment (Chat feedback bubble animation stream)
   ========================================================================== */
interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
}

const initialComments: Comment[] = [
  { 
    id: 1, 
    user: "maya_designs", 
    avatar: "M", 
    text: "This vase is a complete masterpiece! The textured lines are beautiful. 😍" 
  },
  { 
    id: 2, 
    user: "clayseeker", 
    avatar: "C", 
    text: "Can beginners attend the weekend class? I've never touched a potter's wheel." 
  },
  { 
    id: 3, 
    user: "rahul.varma", 
    avatar: "R", 
    text: "Just received my earthy tea mugs. The touch feels incredibly organic. Thank you!" 
  },
];

const newIncomingComment = {
  id: 4,
  user: "slow_ritual",
  avatar: "S",
  text: "Absolutely stunning glazes! Adding these to my kitchen shelves soon."
};

function CommentMockup() {
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // Spawn comments progressively
    const timer1 = setTimeout(() => {
      setCommentsList([initialComments[0]]);
    }, 300);

    const timer2 = setTimeout(() => {
      setCommentsList((prev) => [...prev, initialComments[1]]);
    }, 1100);

    const timer3 = setTimeout(() => {
      setCommentsList((prev) => [...prev, initialComments[2]]);
    }, 2200);

    const timer4 = setTimeout(() => {
      setTyping(true);
    }, 3200);

    const timer5 = setTimeout(() => {
      setTyping(false);
      setCommentsList((prev) => [...prev, newIncomingComment]);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col bg-white text-left max-h-[380px] overflow-hidden"
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#f3e6db]/60">
        <MessageSquare className="h-5 w-5 text-[#9a6b4e]" />
        <h4 className="text-xs font-bold text-[#1b1511]">Comments on @studio.haritham</h4>
        <div className="ml-auto text-[10px] text-[#8a7765]">{commentsList.length} Comments</div>
      </div>

      {/* Comments List */}
      <div className="mt-4 flex-1 flex flex-col gap-3 min-h-[220px] max-h-[250px] overflow-y-auto pr-1">
        <AnimatePresence>
          {commentsList.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-[#fdf2eb] border border-[#ebdccf] flex items-center justify-center text-xs font-bold text-[#9a6b4e] shrink-0">
                {c.avatar}
              </div>
              <div className="bg-[#fcfaf7] border border-[#ebdccf]/40 p-2.5 rounded-2xl flex-1 shadow-sm">
                <div className="text-[10px] font-bold text-[#1b1511]">{c.user}</div>
                <p className="text-xs text-[#6b5f55] mt-0.5 leading-relaxed">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 mt-1 pl-1"
            >
              <div className="h-8 w-8 rounded-full bg-[#f5f0eb] flex items-center justify-center shrink-0">
                <span className="h-4 w-4 border-2 border-dashed border-[#9a6b4e] rounded-full animate-spin" />
              </div>
              <div className="bg-neutral-50 px-3 py-2 rounded-2xl flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input box decoration */}
      <div className="mt-4 pt-3 border-t border-[#f3e6db]/60 flex items-center gap-2">
        <input 
          type="text" 
          placeholder="Add a friendly comment..." 
          disabled 
          className="flex-1 bg-[#fbf8f4] border border-[#e8dfd2]/80 px-3 py-2 rounded-xl text-xs placeholder-[#8a7765]/60 focus:outline-none cursor-not-allowed"
        />
        <div className="h-8 w-8 bg-[#fdf2eb] text-[#9a6b4e] rounded-xl flex items-center justify-center border border-[#ebdccf]">
          <Send className="h-3.5 w-3.5" />
        </div>
      </div>
    </motion.div>
  );
}
