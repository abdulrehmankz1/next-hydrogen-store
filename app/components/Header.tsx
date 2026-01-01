import {Suspense, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {SearchForm} from '~/components/SearchForm';
import {ShoppingCart, User, Search, Heart, X} from 'lucide-react';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <>
      {/* <header className="header">
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
          <strong>{shop.name}</strong>
        </NavLink>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </header> */}

      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 pt-4">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left */}
            <div className="flex items-center">
              <NavLink to="/" className="text-xl font-bold">
                {shop.name}
              </NavLink>
            </div>

            {/* Center */}
            <div className="flex justify-center">
              <HeaderMenu
                menu={menu}
                viewport="desktop"
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            </div>

            {/* Right */}
            <div className="flex justify-end items-center gap-4">
              <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          // <NavLink
          //   className="header-menu-item text-lg md:px-2"
          //   end
          //   key={item.id}
          //   onClick={close}
          //   prefetch="intent"
          //   style={activeLinkStyle}
          //   to={url}
          // >
          //   {item.title}
          // </NavLink>
          <NavLink
            key={item.id}
            to={url}
            end
            onClick={close}
            prefetch="intent"
            className={({isActive}) =>
              `relative text-lg font-normal after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-black after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100 ${isActive ? 'after:scale-x-100' : ''}`
            }
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        {/* <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense> */}
        <Suspense fallback={<User className="w-6 h-6" />}>
          <Await resolve={isLoggedIn}>
            {(isLoggedIn) => (
              <User
                className={`w-6 h-6 ${isLoggedIn ? 'opacity-100' : 'opacity-80'}`}
              />
            )}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />

      <NavLink
        prefetch="intent"
        to="/wishlist"
        style={activeLinkStyle}
        className="relative"
      >
        <Heart className="w-6 h-6 hover:text-red-500 transition-colors" />
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <SearchForm action="/search">
      {({inputRef}) => (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder="Search..."
            className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm"
            name="q"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {isFocused && searchValue.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSearchValue('');
                  if (inputRef.current) {
                    inputRef.current.value = '';
                    inputRef.current.focus();
                  }
                }}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-gray-500 pointer-events-none" />
            )}
          </div>
        </div>
      )}
    </SearchForm>
  );
}
// function CartBadge({ count }: { count: number | null }) {
//   const { open } = useAside();
//   const { publish, shop, cart, prevCart } = useAnalytics();

//   return (
//     <a
//       href="/cart"
//       onClick={(e) => {
//         e.preventDefault();
//         open('cart');
//         publish('cart_viewed', {
//           cart,
//           prevCart,
//           shop,
//           url: window.location.href || '',
//         } as CartViewPayload);
//       }}
//     >
//       Cart {count === null ? <span>&nbsp;</span> : count}
//     </a>
//   );
// }

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  const displayCount = count ?? 0;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
      className="relative flex items-center justify-center p-2 cursor-pointer"
    >
      <ShoppingCart className="w-6 h-6" />
      <span
        className="absolute top-0 right-0 min-w-4 h-4 px-1
        text-[10px] leading-4 rounded-full bg-black text-white
        flex items-center justify-center"
      >
        {displayCount}
      </span>
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
