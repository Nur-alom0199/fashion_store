import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingCart, Star, X, Plus, Minus, LogIn } from "lucide-react";
import { PRODUCTS } from "./constants";
import { CartItem, Product } from "./types";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, onAuthStateChanged, User, signOut } from "firebase/auth";

// --- Components ---

function formatBDT(amount: number) {
  return `৳${amount.toLocaleString("bn-BD")}`;
}

const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart: (id: string) => void }) => {
  const stars = "★".repeat(Math.round(product.rating));
  return (
    <motion.article 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="card__media">
        <div className="card__tag">{product.tag}</div>
        <div className="card__emoji" aria-hidden="true">{product.emoji}</div>
      </div>
      <div className="card__body">
        <h3 className="card__title">{product.name}</h3>
        <div className="card__meta">
          <div className="price">{formatBDT(product.price)}</div>
          <div className="rating">
            {stars} <span style={{ color: "rgba(255,255,255,.7)" }}>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="card__desc">{product.desc}</p>
        <div className="card__actions">
          <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => onAddToCart(product.id)}>
            Add to cart
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default function App() {
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [authError, setAuthError] = useState<string | null>(null);

  useMemo(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 100;
  const total = subtotal + shipping;

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => 
        p.name.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating_desc") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, search, sort]);

  const newArrivals = PRODUCTS.filter((p) => p.tag === "New" || p.tag === "Top").slice(0, 4);

  const addToCart = (id: string, qty = 1) => {
    setCart((prev) => {
      const next = { ...prev };
      next[id] = (next[id] || 0) + qty;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/unauthorized-domain") {
        setAuthError("This domain is not authorized in Firebase Console. Please add it to Authentication > Settings > Authorized domains.");
      } else {
        setAuthError("Sign in failed. Please try again.");
      }
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <div className="brand">
            <a href="#" className="brand__link">Fashion Store</a>
          </div>

          <div className="auth">
            {user ? (
              <div className="flex flex-col items-end">
                <button className="btn btn--ghost text-xs" onClick={() => signOut(auth)}>Sign Out</button>
                <div className="auth__status">{user.displayName || user.email}</div>
              </div>
            ) : (
              <button className="btn btn--ghost" onClick={() => {
                setAuthError(null);
                setIsAuthOpen(true);
              }}>Sign In</button>
            )}
          </div>

          <nav className="nav">
            <a href="#products">Products</a>
            <a href="#new">New</a>
            <a href="#about">About</a>
            <button className="btn btn--ghost flex items-center" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={18} />
              <span className="badge">{cartCount}</span>
            </button>
          </nav>

          <div className="actions">
            <div className="search flex items-center gap-2">
              <Search size={18} className="text-muted" />
              <input 
                type="search" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__text">
              <h1>আপনার স্টাইল, আমাদের কালেকশন।</h1>
              <p>ট্রেন্ডিং ফ্যাশন আইটেম—টিশার্ট, ড্রেস, জিন্স, এক্সেসরিজ। এখনই দেখুন আমাদের এক্সক্লুসিভ কালেকশন এবং সেরা দামে কিনুন।</p>
              <div className="hero__cta">
                <a className="btn btn--primary" href="#products">Shop Now</a>
                <a className="btn btn--ghost" href="#new">See New Arrivals</a>
              </div>
              <div className="hero__chips">
                <span className="chip">Free shipping (BD)</span>
                <span className="chip">Cash on delivery</span>
                <span className="chip">Easy returns</span>
              </div>
            </div>

            <div className="hero__card">
              <div className="hero__cardGlow"></div>
              <div className="hero__cardInner">
                <div className="hero__pill">Summer Drop</div>
                <h2>New Season Essentials</h2>
                <p>৳799 থেকে শুরু</p>
                <a className="btn btn--primary" href="#products">Explore</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="products">
          <div className="container section__head">
            <div>
              <h2>Featured Products</h2>
              <p className="muted">ক্যাটাগরি/সার্চ করে আপনার পছন্দের আইটেম খুঁজুন।</p>
            </div>

            <div className="filters">
              <label className="select">
                <span className="select__label">Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">All</option>
                  <option value="tshirt">T-Shirts</option>
                  <option value="dress">Dresses</option>
                  <option value="jeans">Jeans</option>
                  <option value="accessories">Accessories</option>
                </select>
              </label>

              <label className="select">
                <span className="select__label">Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low</option>
                  <option value="price_desc">Price: High</option>
                  <option value="rating_desc">Rating</option>
                </select>
              </label>
            </div>
          </div>

          <div className="container" id="productGrid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={(id) => addToCart(id)} />
            ))}
          </div>
        </section>

        <section className="section section--alt" id="new">
          <div className="container section__head">
            <div>
              <h2>New Arrivals</h2>
              <p className="muted">সম্প্রতি যুক্ত করা আইটেমগুলো।</p>
            </div>
            <button className="btn btn--ghost" onClick={() => {
              setSearch("");
              setCategory("all");
              setSort("featured");
            }}>Clear filters</button>
          </div>

          <div className="container" id="newArrivalsGrid">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={(id) => addToCart(id)} />
            ))}
          </div>
        </section>

        <section className="section" id="about">
          <div className="container about">
            <div>
              <h2>About Fashion Store</h2>
              <p className="muted">
                আমরা আপনাদের জন্য এমন সব ফ্যাশন বাছাই করি—যেগুলো দেখতে সুন্দর, মানে উন্নত এবং দামে সাশ্রয়ী। প্রতিটি পণ্য যত্ন সহকারে নির্বাচিত এবং মান পরীক্ষিত।
              </p>
              <ul className="bullets">
                <li>Quality checked products</li>
                <li>Fast & secure delivery</li>
                <li>Support for exchanges & returns</li>
              </ul>
            </div>
            <div className="about__panel">
              <h3>Order in 3 steps</h3>
              <ol className="steps">
                <li>Choose your products</li>
                <li>Add to cart & checkout</li>
                <li>Receive at your doorstep</li>
              </ol>
              <div className="about__note">Demo website</div>
            </div>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <>
            <motion.div 
              className="overlay overlay--auth" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
            />
            <motion.div 
              className="authModal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="authModal__panel" onClick={(e) => e.stopPropagation()}>
                <button className="iconBtn authModal__close" onClick={() => setIsAuthOpen(false)}>
                  <X size={18} />
                </button>
                <header className="authModal__header">
                  <div>
                    <h2>Welcome back</h2>
                    <p className="muted">Sign in to continue shopping with your style.</p>
                  </div>
                </header>

                <div className="form mt-4">
                  <button className="btn btn--google w-full flex items-center justify-center gap-2" onClick={handleGoogleSignIn}>
                    <LogIn size={18} />
                    Continue with Google
                  </button>
                  {authError && (
                    <p className="text-red-400 text-xs mt-3 p-2 bg-red-400/10 rounded-lg border border-red-400/20 text-center">
                      {authError}
                    </p>
                  )}
                  <p className="form__hint text-center mt-2">
                    Google sign-in is connected for this demo.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              className="overlay" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside 
              className="cart" 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ display: "flex" }}
            >
              <div className="cart__head">
                <div>
                  <h2>Your Cart</h2>
                  <p className="muted">{cartCount} items</p>
                </div>
                <button className="iconBtn" onClick={() => setIsCartOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="cart__items">
                {Object.entries(cart).map(([id, qty]) => {
                  const p = PRODUCTS.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <div key={id} className="cartItem">
                      <div className="cartItem__thumb">{p.emoji}</div>
                      <div>
                        <div className="cartItem__name">{p.name}</div>
                        <p className="cartItem__sub">{formatBDT(p.price)} × {qty}</p>
                      </div>
                      <div className="cartItem__right">
                        <div className="cartItem__row">
                          <button className="iconBtn" onClick={() => addToCart(id, -1)}><Minus size={14} /></button>
                          <span>{qty}</span>
                          <button className="iconBtn" onClick={() => addToCart(id, 1)}><Plus size={14} /></button>
                        </div>
                        <button className="btn btn--ghost text-xs mt-1" onClick={() => addToCart(id, -qty)}>Remove</button>
                      </div>
                    </div>
                  );
                })}
                {cartCount === 0 && (
                  <div className="muted text-center py-8">Cart is empty. Add some stylish items ✨</div>
                )}
              </div>

              <div className="cart__summary">
                <div className="line">
                  <span>Subtotal</span>
                  <strong>{formatBDT(subtotal)}</strong>
                </div>
                <div className="line">
                  <span>Shipping</span>
                  <strong>{formatBDT(shipping)}</strong>
                </div>
                <div className="line line--total">
                  <span>Total</span>
                  <strong>{formatBDT(total)}</strong>
                </div>
                <button className="btn btn--primary w-full mt-4" onClick={() => alert("Checkout demo completed!")}>
                  Checkout
                </button>
                <button className="btn btn--ghost w-full mt-2" onClick={() => setCart({})}>Clear cart</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <footer className="footer">
        <div className="container footer__inner">
          <div>
            <strong>Fashion Store</strong>
            <div className="muted">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
          <div className="footer__links">
            <a href="#products">Products</a>
            <a href="#about">About</a>
          </div>
        </div>
      </footer>
    </>
  );
}
