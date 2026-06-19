import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-field rounded-md flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Field<span className="text-field-400">Work</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              The sports job board connecting workers and organizations for baseball, basketball, and softball.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">My Badges</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/companies" className="hover:text-white transition-colors">Organizations</Link></li>
              <li><Link to="/register?role=employer" className="hover:text-white transition-colors">Employer Sign-Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>&copy; {new Date().getFullYear()} FieldWork. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
