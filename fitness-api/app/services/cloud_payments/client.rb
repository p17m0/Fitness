require "net/http"
require "json"

module CloudPayments
  class Client
    API_BASE = "https://api.cloudpayments.ru".freeze

    def initialize(public_id:, api_secret:)
      @public_id = public_id
      @api_secret = api_secret
    end

    def charge(amount:, currency:, ip_address:, card_cryptogram_packet:, name: nil, account_id: nil, invoice_id: nil, description: nil)
      request(
        "/payments/cards/charge",
        {
          Amount: amount,
          Currency: currency,
          IpAddress: ip_address,
          CardCryptogramPacket: card_cryptogram_packet,
          Name: name,
          AccountId: account_id,
          InvoiceId: invoice_id,
          Description: description
        }.compact
      )
    end

    def post3ds(transaction_id:, pa_res:)
      request(
        "/payments/cards/post3ds",
        {
          TransactionId: transaction_id,
          PaRes: pa_res
        }
      )
    end

    private

    def request(path, payload)
      uri = URI.join(API_BASE, path)
      request = Net::HTTP::Post.new(uri)
      request.basic_auth(@public_id, @api_secret)
      request["Content-Type"] = "application/json"
      request.body = payload.to_json

      response = Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|
        http.request(request)
      end

      parse_response(response)
    rescue StandardError => e
      { "Success" => false, "Message" => e.message }
    end

    def parse_response(response)
      body = response.body.to_s
      json = body.empty? ? {} : JSON.parse(body)
      return json if response.is_a?(Net::HTTPSuccess)

      json["Success"] = false if json.is_a?(Hash)
      json["Message"] ||= "HTTP #{response.code}"
      json
    rescue JSON::ParserError
      { "Success" => false, "Message" => "Invalid response from CloudPayments" }
    end
  end
end
