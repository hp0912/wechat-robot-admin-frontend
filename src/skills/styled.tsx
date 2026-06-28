import styled from 'styled-components';

export const CardsContainer = styled.div`
	height: calc(100vh - 245px);
	overflow: hidden auto;
	display: grid;
	gap: 16px;

	@media (min-width: 1280px) {
		grid-template-columns: repeat(1, 1fr);
	}

	@media (min-width: 1680px) {
		grid-template-columns: repeat(2, 1fr);
	}
`;
