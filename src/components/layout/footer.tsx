import { Facebook, Instagram, Moon, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Instagram, href: '#', name: 'Instagram' },
    { icon: Twitter, href: '#', name: 'Twitter' },
  ];

  const footerSections = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Our Story', href: '#' },
        { label: 'Sustainability', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
      ],
    },
  ];

  return (
    <footer id="contact" className="bg-background/80 backdrop-blur-sm border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Moon className="h-7 w-7 text-primary" />
              <span className="font-headline text-2xl font-bold text-foreground">
                LUNA
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nurturing Nature, Enriching You.
            </p>
            <div className="flex gap-4 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-headline font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
             <h3 className="font-headline font-semibold mb-4">Contact Info</h3>
             <address className="not-italic text-sm text-muted-foreground space-y-2">
                <p>Luna Industries Limited</p>
                <p>Ruiru, Kenya</p>
                <a href="tel:+254205207435" className="block hover:text-primary">Tel: +254 20 5207435</a>
                <a href="mailto:info@luna.co.ke" className="block hover:text-primary">Email: info@luna.co.ke</a>
             </address>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Luna Industries Limited. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
