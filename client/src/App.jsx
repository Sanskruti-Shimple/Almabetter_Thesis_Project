import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    bag: <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    leaf: <><path d="M20 4c-9 0-14 4-14 11a5 5 0 0 0 5 5c7 0 9-8 9-16Z" /><path d="M4 21c3-5 6-8 12-11" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("marketnest-cart") || "{}"); }
    catch { return {}; }
  });
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("marketnest-session") || "null"); }
    catch { return null; }
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    setLoading(true);
    setError("");
    api(`/products?${params}`)
      .then((items) => { if (alive) setProducts(items); })
      .catch((err) => { if (alive) setError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [category, query]);

  useEffect(() => {
    localStorage.setItem("marketnest-cart", JSON.stringify(cart));
  }, [cart]);

  const categories = ["All", "Accessories", "Apparel", "Home"];
  const cartItems = useMemo(
    () => products.filter((product) => cart[product._id]).map((product) => ({ ...product, quantity: cart[product._id] })),
    [products, cart]
  );
  const cartCount = Object.values(cart).reduce((sum, value) => sum + value, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function addToCart(product) {
    setCart((current) => ({ ...current, [product._id]: Math.min((current[product._id] || 0) + 1, 99) }));
    showToast(`${product.name} added to your bag`);
  }

  function changeQuantity(id, delta) {
    setCart((current) => {
      const quantity = (current[id] || 0) + delta;
      if (quantity <= 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: Math.min(quantity, 99) };
    });
  }

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const result = await api(`/auth/${authMode === "login" ? "login" : "register"}`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      setSession(result);
      localStorage.setItem("marketnest-session", JSON.stringify(result));
      setAuthOpen(false);
      showToast(`Welcome${result.user.name ? `, ${result.user.name.split(" ")[0]}` : ""}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    if (!session?.token) {
      setCartOpen(false);
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const order = await api("/orders", {
        method: "POST",
        token: session.token,
        body: JSON.stringify({ items: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })) })
      });
      setCart({});
      setCartOpen(false);
      showToast(`Order placed · ${money(order.total)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    setSession(null);
    localStorage.removeItem("marketnest-session");
    showToast("You have been signed out");
  }

  return (
    <div className="site-shell">
      <div className="announcement"><Icon name="leaf" size={15} /> Thoughtful finds, made for everyday living <span className="announcement-sep">·</span> Free shipping over $75</div>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="MarketNest home">market<span>nest</span><i>.</i></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#shop">Shop all</a><a href="#shop" onClick={() => setCategory("Home")}>Home goods</a><a href="#story">Our story</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-toggle" aria-label="Focus search" onClick={() => document.getElementById("product-search")?.focus()}><Icon name="search" /></button>
          {session ? <button className="account-button" onClick={signOut}>Hi, {session.user.name.split(" ")[0]} <span>· Sign out</span></button> : <button className="account-button" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>Sign in</button>}
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag, ${cartCount} items`}><Icon name="bag" /><span>Bag</span><b>{cartCount}</b></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-line" /> THE EVERYDAY EDITION</div>
            <h1>Find your<br /><em>everyday.</em></h1>
            <p>Good things for the spaces you live in, the rituals you love, and everywhere life takes you.</p>
            <a href="#shop" className="primary-button">Explore the collection <Icon name="arrow" size={17} /></a>
            <div className="hero-note"><span className="note-stars">★★★★★</span> <span>Loved by 2,000+ happy homes</span></div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=90" alt="Warm, sunlit living room with natural textures" />
            <div className="hero-image-label"><span>THE SLOW LIVING COLLECTION</span><b>Small things. Better days.</b></div>
            <div className="image-index">01 <span /> 04</div>
          </div>
          <div className="hero-side-note">MADE TO BE KEPT <span>—</span> MADE TO BE LOVED</div>
        </section>

        <section className="value-strip" aria-label="Our values">
          <div><Icon name="leaf" /><span>Considered materials</span></div>
          <span className="value-divider" />
          <div><Icon name="star" /><span>Small makers, big heart</span></div>
          <span className="value-divider" />
          <div><Icon name="bag" /><span>Thoughtful from day one</span></div>
        </section>

        <section id="shop" className="shop-section">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> A LITTLE OF WHAT YOU LOVE</div><h2>Good things, <em>gathered.</em></h2></div>
            <label className="search-field"><Icon name="search" size={18} /><input id="product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your next favorite" /></label>
          </div>
          <div className="catalog-toolbar">
            <div className="category-list" role="group" aria-label="Filter by category">
              {categories.map((item) => <button key={item} className={`category-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <span className="result-count">{loading ? "Finding good things…" : `${products.length} lovely ${products.length === 1 ? "find" : "finds"}`}</span>
          </div>
          {error && !authOpen && <div className="inline-error" role="alert">{error}</div>}
          {loading ? <div className="loading-state">A moment while we gather everything…</div> :
            products.length ? <div className="product-grid">{products.map((product, index) => (
              <article className="product-card" key={product._id}>
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.name} loading={index > 3 ? "lazy" : "eager"} />
                  {product.featured && <span className="product-badge">A GOOD FIND</span>}
                  <button className="quick-add" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to bag`}><Icon name="plus" size={19} /></button>
                </div>
                <div className="product-meta"><span>{product.category}</span><span>{money(product.price)}</span></div>
                <h3>{product.name}</h3><p>{product.description}</p>
              </article>
            ))}</div> : <div className="empty-state"><span>Nothing here just yet.</span><p>Try another search or explore all of our finds.</p><button onClick={() => { setQuery(""); setCategory("All"); }}>See everything <Icon name="arrow" size={16} /></button></div>
          }
        </section>

        <section className="story-section" id="story">
          <div className="story-image"><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1100&q=85" alt="Sunlight and greenery in a calm home" loading="lazy" /></div>
          <div className="story-copy"><div className="eyebrow"><span className="eyebrow-line" /> A NOTE FROM OUR LITTLE CORNER</div><h2>Buy less.<br /><em>Love it longer.</em></h2><p>We believe the best things aren't the ones you replace next season. They're the ones that find their way into your everyday — made with care, chosen with intention, and kept close.</p><a href="#shop" className="text-link">A little more about us <Icon name="arrow" size={17} /></a></div>
        </section>
      </main>

      <footer className="site-footer"><a className="wordmark footer-mark" href="#">market<span>nest</span><i>.</i></a><p>Considered goods for the everyday.</p><span>© {new Date().getFullYear()} MarketNest. A research prototype.</span></footer>

      {cartOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your shopping bag">
          <div className="drawer-header"><div><span className="eyebrow">YOUR LITTLE COLLECTION</span><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-button" aria-label="Close bag" onClick={() => setCartOpen(false)}><Icon name="close" /></button></div>
          <div className="drawer-items">{cartItems.length ? cartItems.map((item) => <div className="cart-item" key={item._id}>
            <img src={item.image} alt="" /><div className="cart-item-info"><h3>{item.name}</h3><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item._id, -1)} aria-label={`Remove one ${item.name}`}><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item._id, 1)} aria-label={`Add one ${item.name}`}><Icon name="plus" size={14} /></button></div></div>
          </div>) : <div className="empty-bag"><Icon name="bag" size={31} /><p>Your bag is waiting for something lovely.</p><button onClick={() => setCartOpen(false)}>Explore the collection <Icon name="arrow" size={16} /></button></div>}</div>
          {cartItems.length > 0 && <div className="drawer-footer"><div className="shipping-progress"><Icon name="leaf" size={17} /><span>{subtotal >= 75 ? "Your shipping is on us!" : `You're ${money(75 - subtotal)} away from free shipping`}</span></div><div className="subtotal"><span>Subtotal</span><b>{money(subtotal)}</b></div><p>Shipping and taxes calculated at checkout.</p>{error && <div className="inline-error" role="alert">{error}</div>}<button className="checkout-button" onClick={checkout} disabled={busy}>{busy ? "One moment…" : session ? "Place your order" : "Sign in to check out"} <Icon name="arrow" size={17} /></button><small>Secure checkout · No payment is collected in this demo</small></div>}
        </aside>
      </div>}

      {authOpen && <div className="overlay auth-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }}>
        <section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="icon-button auth-close" aria-label="Close sign in" onClick={() => setAuthOpen(false)}><Icon name="close" /></button><div className="eyebrow"><span className="eyebrow-line" /> YOUR MARKETNEST</div><h2 id="auth-title">{authMode === "login" ? "Welcome back." : "Make yourself at home."}</h2><p className="auth-intro">{authMode === "login" ? "Sign in to continue to your good finds." : "Create an account to keep all your good finds together."}</p><form onSubmit={submitAuth}>
          {authMode === "register" && <label>Your name<input name="name" autoComplete="name" required maxLength="80" /></label>}
          <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
          <label>Password<input type="password" name="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength="8" maxLength="72" required /></label>
          {error && <div className="inline-error" role="alert">{error}</div>}<button className="checkout-button" disabled={busy}>{busy ? "One moment…" : authMode === "login" ? "Sign in" : "Create my account"} <Icon name="arrow" size={17} /></button>
        </form><p className="auth-switch">{authMode === "login" ? "New around here?" : "Already have an account?"} <button onClick={() => { setError(""); setAuthMode(authMode === "login" ? "register" : "login"); }}>{authMode === "login" ? "Create an account" : "Sign in"}</button></p><small className="demo-note">Demo only. Use a unique password; do not reuse a real account password.</small></section>
      </div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
