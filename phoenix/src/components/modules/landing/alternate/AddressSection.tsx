import Mapbox from 'components/base/MapBox';
import { Col, Row } from 'react-bootstrap';
import HelpCenter from '../default/address/HelpCenter';
import QueryForm from '../default/address/QueryForm';

const AddressSection = () => {
  return (
    <section className="pb-10 pb-xl-14">
      <div className="container-small px-lg-7 px-xxl-3">
        <div className="text-center mb-7">
          <h5 className="text-info mb-3">Contact</h5>
          <h2 className="mb-2">Choose the best deal for you</h2>
        </div>
        <div className="mb-15">
          <Mapbox
            className="rounded-4"
            style={{ height: 380 }}
            options={{
              center: [-74.0020158, 40.7228022],
              zoom: 14,
              scrollZoom: false
            }}
          />
        </div>
        <Row className="g-5 g-lg-5">
          <Col
            xs={12}
            md={6}
            className="mb-5 mb-md-0 text-center text-md-start"
          >
            <HelpCenter />
          </Col>
          <Col xs={12} md={6} className="text-center text-md-start">
            <QueryForm />
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default AddressSection;
