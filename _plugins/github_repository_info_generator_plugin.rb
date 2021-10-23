require 'net/http'
require 'uri'
require 'json'

def load_gh_data (repository)
  root_data = load_repository repository

  if root_data.nil?
    return nil
  end

  releases = load_releases repository
  languages = load_languages repository

  data = Hash.new

  unless root_data['license'].nil?
    data['license'] = root_data['license']['name']
  end

  unless releases.empty?
    last_release = releases[0]
    data['version'] = last_release['name']
  end

  unless languages.empty?
    data['languages'] = []

    languages.each do |key, value|
      lang_entry = Hash.new
      lang_entry['language'] = key
      lang_entry['total'] = value

      data['languages'].push lang_entry
    end
  end

  return data
end

def load_repository (repository)
  response = Net::HTTP.get_response URI('https://api.github.com/repos/' + repository)

  if response.code == 200
    JSON.parse response
  end

  return nil
rescue
  return nil
end

def load_releases (repository)
  response = Net::HTTP.get_response URI('https://api.github.com/repos/' + repository + '/releases')

  if response.code == 200
    JSON.parse response
  end

  return nil
rescue
  return []
end

def load_languages (repository)
  response = Net::HTTP.get URI('https://api.github.com/repos/' + repository + '/languages')

  JSON.parse response
rescue
  return Hash.new
end

Jekyll::Hooks.register [:site], :pre_render do |site, payload|
  unless site.collections['projects'].nil?
    if site.data['github_repositories'].nil?
      site.data['github_repositories'] = Hash.new
    end

    repository_entries = site.data['github_repositories']

    site.collections['projects'].docs.each do |doc|
      type = doc.data['repository_type']

      if type.nil? || type != 'github'
        next
      end

      repository = doc.data['repository']

      puts repository

      if repository_entries[repository]
        puts 'already in hash'
        next
      end

      puts 'try loading from github'

      repository_data = load_gh_data repository

      if repository_data.nil?
        puts 'unable to fetch data'
        next
      end

      repository_entries[repository] = repository_data
      puts repository_entries[repository]
    end
  end
end
